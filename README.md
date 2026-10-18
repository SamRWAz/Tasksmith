# Tasksmith 🔨✨

> Plataforma web para la conexión de hogares con maestros de oficios calificados con garantía, evaluación práctica y acreditación pericial mediante Inteligencia Artificial.

---

## 🚀 Descripción del Proyecto

**Tasksmith** transforma la contratación de servicios técnicos para el hogar (plomería, electricidad, carpintería, pintura, cerrajería, refrigeración y albañilería), dignificando la labor de los maestros especialistas y brindando total tranquilidad a las familias colombianas.

En lugar de requerir títulos burocráticos, Tasksmith valida la experiencia real en terreno a través de:
1. **Pruebas de diagnóstico técnico situacional**.
2. **Documentación fotográfica en vivo con cámara integrada**.
3. **Notas de voz explicativas grabadas por el artesano**.
4. **Motor pericial de Inteligencia Artificial** que compara el testimonio técnico contra normas oficiales (RETIE, NTC 1500, NSR-10, etc.) y expide la **Acreditación Oficial Smith**.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5 Semántico**: Estructura modular multidispositivo accesible.
- **CSS3 Vanilla ("Modern Craft")**:
  - Paleta cálida, profesional y minimalista inspirada en talleres modernos.
  - Sistema de variables de diseño, sombras sutiles, microinteracciones y efectos de cristal (*glassmorphism*).
  - Hoja de estilos de impresión (`@media print`) para diplomas y certificados oficiales.
- **JavaScript Moderno (ES6+)**:
  - Gestión de estado de sesión local (`localStorage`) para hogares y maestros.
  - Asistente interactivo de certificación técnica en 4 fases.
  - Capturador de cámara en tiempo real mediante `navigator.mediaDevices.getUserMedia` y renderizado en `<canvas>`.
  - Grabador y reproductor de audio interactivo con simulación de espectro y visualizador de barras.
  - Motor de IA de peritaje técnico y correspondencia semántica con bases de conocimiento experto.
- **Three.js**:
  - Diorama 3D interactivo en la página principal que representa de forma minimalista el taller y las herramientas del oficio.

---

## 📂 Estructura de Páginas

| Archivo | Propósito |
| :--- | :--- |
| `index.html` | Página de bienvenida para familias y clientes con escena 3D, oficios populares y cotizador rápido. |
| `certificacion.html` | Asistente de 4 fases para la acreditación técnica de maestros con evaluación de IA y diploma imprimible. |
| `portal-smiths.html` | Portal exclusivo para artesanos y técnicos (beneficios, tarifas, portafolio y acceso a la comunidad). |
| `como-funciona.html` | Guía detallada del proceso de solicitud, pago seguro y garantía de 30 días. |
| `oficios.html` | Catálogo de especialidades técnicas disponibles. |
| `confianza.html` | Pilares de seguridad, verificación de antecedentes y garantía Tasksmith. |
| `precios.html` | Filosofía de precios transparentes y tarifas justas para el cliente y el maestro. |
| `styles.css` | Sistema de diseño global y componentes visuales. |
| `app.js` | Lógica de negocio, autenticación, Three.js, cámara, audio y motor de IA. |

---

## 🤖 Funcionamiento del Asistente de Certificación con IA

1. **Paso 1 (Elegir Oficio)**: El usuario selecciona su especialidad técnica principal (ej: Plomería, Electricidad, Carpintería, etc.).
2. **Paso 2 (Examen Teórico)**: Responde casos reales de diagnóstico técnico y recibe su calificación cuantitativa.
3. **Paso 3 (Evidencias de Obra)**:
   - Abre la cámara del dispositivo (`📸 Abrir Cámara`) y captura fotografías del trabajo.
   - Graba un audio explicativo describiendo el diagnóstico, los materiales/herramientas y las pruebas de garantía.
   - Opción de añadir pasos adicionales (`+ Agregar otra foto y audio explicativo`).
4. **Paso 4 (Auditoría por IA & Diploma)**:
   - El motor de IA analiza el espectro del audio y transcribe el testimonio.
   - Compara las técnicas y materiales mencionados contra la Base de Conocimiento Experto del oficio.
   - Audita 4 dimensiones: Diagnóstico, Materiales/Herramientas, Procedimiento y Seguridad.
   - Emite el **Certificado Oficial de Idoneidad Técnica** con Hash único, código QR y soporte para imprimir en PDF.

---

## 💻 Ejecución Local

Para levantar el servidor localmente en cualquier máquina:

```bash
# Con Python 3
python -m http.server 8080

# O utilizando Node.js (con npx http-server)
npx http-server -p 8080
```

Luego abre tu navegador en:
```
http://localhost:8080/index.html
```

---

## 👤 Autor

- **SamRWAz** — [GitHub](https://github.com/SamRWAz)
