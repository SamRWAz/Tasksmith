const fs = require('fs');
const path = require('path');

const TMP_DB_FILE = path.join('/tmp', 'tasksmith_cert_db_v2.json');
const DEFAULT_WEBHOOK_UUID = '799690df-4acc-47fa-a61a-d15d6e563175';
const DEFAULT_NTFY_CHANNEL = 'tasksmith_hci_2026_cert_db_v1';

// Memoria en caliente por instancia serverless
const memoryStore = new Map();
const deletedIdsStore = new Set();

function readTmpStore() {
  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const raw = fs.readFileSync(TMP_DB_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.records)) {
        parsed.records.forEach(r => {
          if (r && r.id) memoryStore.set(r.id, r);
        });
      }
      if (parsed && Array.isArray(parsed.deletedIds)) {
        parsed.deletedIds.forEach(id => deletedIdsStore.add(id));
      }
    }
  } catch (e) {
    // Ignorar errores de lectura en /tmp
  }
}

function writeTmpStore() {
  try {
    const payload = {
      updatedAt: new Date().toISOString(),
      deletedIds: Array.from(deletedIdsStore),
      records: Array.from(memoryStore.values())
    };
    fs.writeFileSync(TMP_DB_FILE, JSON.stringify(payload), 'utf8');
  } catch (e) {
    // Ignorar errores de escritura en /tmp
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-Channel');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  readTmpStore();

  const channel = String(req.query?.channel || req.headers['x-channel'] || DEFAULT_NTFY_CHANNEL).trim();
  const webhookUuid = DEFAULT_WEBHOOK_UUID;

  // 1. GUARDAR UN REGISTRO NUEVO O ACTUALIZADO (POST / PUT)
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      let record = req.body;
      if (typeof record === 'string') {
        record = JSON.parse(record);
      }
      if (!record || !record.id) {
        return res.status(400).json({ ok: false, error: 'El registro no incluye un ID válido.' });
      }

      // Guardar en memoria y /tmp de inmediato
      deletedIdsStore.delete(record.id);
      memoryStore.set(record.id, record);
      writeTmpStore();

      const bodyStr = JSON.stringify(record);
      const tasks = [];

      // Guardar en almacén persistente Webhook.site (soporta JSON grandes con fotos y audios)
      tasks.push(
        fetchWithTimeout(`https://webhook.site/${webhookUuid}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr
        }, 8000).catch(() => null)
      );

      // Respaldo adicional en ntfy.sh
      tasks.push(
        fetchWithTimeout(`https://ntfy.sh/${encodeURIComponent(channel)}`, {
          method: 'PUT',
          headers: { 'Filename': `${record.id}.json` },
          body: bodyStr
        }, 6000).catch(() => null)
      );

      await Promise.allSettled(tasks);

      return res.status(200).json({
        ok: true,
        id: record.id,
        savedAt: new Date().toISOString()
      });
    } catch (err) {
      return res.status(500).json({
        ok: false,
        error: err.message || 'Error interno al guardar el registro.'
      });
    }
  }

  // 2. ELIMINAR UN REGISTRO (DELETE)
  if (req.method === 'DELETE') {
    const id = String(req.query?.id || '').trim();
    if (!id) {
      return res.status(400).json({ ok: false, error: 'Falta parámetro id.' });
    }
    deletedIdsStore.add(id);
    memoryStore.delete(id);
    writeTmpStore();

    try {
      // Registrar marca de borrado y limpiar en Webhook.site si existe
      const rGet = await fetchWithTimeout(
        `https://webhook.site/token/${webhookUuid}/requests?sorting=newest&per_page=100`,
        { headers: { 'Accept': 'application/json' } },
        6000
      );
      if (rGet && rGet.ok) {
        const data = await rGet.json();
        const items = Array.isArray(data.data) ? data.data : [];
        for (const item of items) {
          try {
            const parsed = JSON.parse(item.content || '{}');
            if (parsed && parsed.id === id && item.uuid) {
              await fetchWithTimeout(
                `https://webhook.site/token/${webhookUuid}/request/${item.uuid}`,
                { method: 'DELETE' },
                4000
              );
            }
          } catch (e) {}
        }
      }
    } catch (e) {}

    return res.status(200).json({ ok: true, deletedId: id });
  }

  // 3. CONSULTAR TODOS LOS REGISTROS GUARDADOS (GET)
  if (req.method === 'GET') {
    try {
      // A) Leer desde Webhook.site (almacén principal en la nube)
      try {
        const rWh = await fetchWithTimeout(
          `https://webhook.site/token/${webhookUuid}/requests?sorting=newest&per_page=100`,
          { headers: { 'Accept': 'application/json' } },
          7500
        );
        if (rWh && rWh.ok) {
          const whData = await rWh.json();
          const whList = Array.isArray(whData.data) ? whData.data : [];
          // Recorrer de más antiguo a más reciente para que actualizaciones del mismo ID prevalezcan
          for (let i = whList.length - 1; i >= 0; i--) {
            const item = whList[i];
            if (!item || !item.content) continue;
            try {
              const parsed = JSON.parse(item.content);
              if (parsed && parsed.type === 'delete' && parsed.targetId) {
                deletedIdsStore.add(parsed.targetId);
                memoryStore.delete(parsed.targetId);
              } else if (parsed && parsed.id && !deletedIdsStore.has(parsed.id)) {
                memoryStore.set(parsed.id, parsed);
              }
            } catch (e) {}
          }
        }
      } catch (e) {}

      // B) Leer respaldo desde ntfy.sh si hay mensajes disponibles
      try {
        const rNtfy = await fetchWithTimeout(
          `https://ntfy.sh/${encodeURIComponent(channel)}/json?poll=1&since=all`,
          {},
          4500
        );
        if (rNtfy && rNtfy.ok) {
          const text = await rNtfy.text();
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          for (const line of lines) {
            try {
              const msg = JSON.parse(line);
              if (!msg || msg.event !== 'message') continue;
              if (msg.attachment && msg.attachment.url) {
                const attId = (msg.attachment.name || '').replace(/\.json$/i, '');
                if (attId && (deletedIdsStore.has(attId) || memoryStore.has(attId))) continue;
                const fileResp = await fetchWithTimeout(msg.attachment.url, {}, 4000);
                if (fileResp && fileResp.ok) {
                  const rec = await fileResp.json();
                  if (rec && rec.id && !deletedIdsStore.has(rec.id)) {
                    memoryStore.set(rec.id, rec);
                  }
                }
              } else if (msg.message && msg.message.startsWith('{')) {
                const rec = JSON.parse(msg.message);
                if (rec && rec.id && !deletedIdsStore.has(rec.id)) {
                  memoryStore.set(rec.id, rec);
                }
              }
            } catch (e) {}
          }
        }
      } catch (e) {}

      writeTmpStore();

      const records = Array.from(memoryStore.values())
        .filter(r => r && r.id && !deletedIdsStore.has(r.id))
        .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

      return res.status(200).json({
        ok: true,
        count: records.length,
        records
      });
    } catch (err) {
      const fallbackRecords = Array.from(memoryStore.values())
        .filter(r => r && r.id && !deletedIdsStore.has(r.id))
        .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
      return res.status(200).json({
        ok: true,
        count: fallbackRecords.length,
        records: fallbackRecords
      });
    }
  }

  return res.status(405).json({ ok: false, error: 'Método no permitido' });
};
