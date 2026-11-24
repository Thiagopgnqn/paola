const fs = require('fs');

const comprehensiveGuide = `## Módulo de Marketing, Campañas y Motor de Precios (Guía Completa para la Administradora)

El módulo de **Marketing y Campañas** de Nocturna SexShop es una solución integral y transparente para planificar, publicar y medir campañas comerciales (Black Friday, Cyber Sale, Día de la Madre, San Valentín, Navidad, Liquidación de temporada o campañas neutras), con paridad al 100% entre el **Modo Demo en navegador** y el **Backend PostgreSQL**.

---

### 1. Guía Paso a Paso: "Cómo armar una Campaña en Tienda Nocturna"

La administradora gestiona las campañas desde el panel en \`/admin/campanas\`:

1. **Crear o Editar Campaña:**
   - Hacer clic en **"+ Nueva Campaña"** en \`/admin/campanas\` para abrir el asistente guiado.
   - **Datos Generales:** Nombre (ej. *Black Friday Nocturna*), slug de URL amigable (ej. \`black-friday\`), fechas de inicio y fin en zona horaria \`America/Argentina/Cordoba\`.
   - **Tema Visual y Estilo:** Seleccionar la paleta temática (\`black-friday\` dorado/ámbar, \`cyber-sale\` neón cian, \`dia-de-la-madre\` rosa suave, \`san-valentin\` carmesí romántico, \`navidad\` esmeralda/oro, \`liquidacion\` violeta/fucsia o \`neutro\`).
   - **Textos de Comunicación:** Título principal, subtítulo, condiciones legales de la promoción y texto de la barra de anuncios superior.
   - **Cuenta Regresiva:** Activar el temporizador con la fecha/hora real de finalización.

2. **Asociar Promociones y Reglas de Descuento:**
   - Descuento porcentual en categorías completas (ej. *20% OFF en Lencería*).
   - Precio promocional fijo para productos destacados.
   - Promociones por cantidad: **2x1**, **3x2** o *2do al 50%* en productos seleccionados.
   - Definir si son acumulables o si gana el mayor beneficio para el cliente.

3. **Crear Cupones Exclusivos (Opcional):**
   - Desde el paso de cupones o en \`/admin/cupones\`, crear códigos como \`BLACKFRIDAY\`, \`NOCTURNA10\` o \`ENVIOGRATIS\`.
   - Configurar tipo (porcentaje, monto fijo en ARS o envío gratis), monto mínimo de compra y tope máximo de descuento.

4. **Diseñar la Portada de la Campaña (\`/admin/portada\`):**
   - En el constructor visual de portada, seleccionar la campaña creada.
   - Podés aplicar una plantilla recomendada con 1 clic (ej. *Plantilla Black Friday*) o agregar/reordenar secciones:
     - Hero promocional con imagen erótica sutil y botones de llamada a la acción.
     - Barra de cuenta regresiva activa.
     - Grillas de productos con insignia de oferta.
     - Colecciones temáticas (Fantasías, Lencería, Cosmética).
     - Bloque de suscripción al Newsletter.

5. **Vista Previa en Tiempo Real:**
   - Utilizar el botón **"Ver vista previa"** con el parámetro seguro \`?preview=<id>\` para revisar cómo se verá la portada completa de la tienda y la página dedicada (\`/campanas/:slug\`) antes de activarla.

6. **Compartir con Enlaces UTM y Códigos QR (100% Offline):**
   - En la tarjeta de la campaña, presionar el botón **"Compartir & QR"**.
   - Se abrirá la ventana con los enlaces prearmados para cada canal:
     - **Instagram (Bio/Historias):** \`...?utm_source=instagram&utm_medium=social&utm_campaign=:slug\`
     - **WhatsApp (Difusión/Chat):** \`...?utm_source=whatsapp&utm_medium=chat&utm_campaign=:slug\`
     - **Meta Ads (Publicidad paga):** \`...?utm_source=facebook&utm_medium=cpc&utm_campaign=:slug\`
     - **Email / Newsletter:** \`...?utm_source=newsletter&utm_medium=email&utm_campaign=:slug\`
   - Botón de **1-click copy** para copiar cualquier enlace al portapapeles.
   - **Generador de Código QR por código:** Permite visualizar y descargar la imagen PNG del código QR generado de forma 100% local en el navegador (sin servicios de terceros ni fugas de datos), listo para imprimir en packaging, folletos o cartelería local.

7. **Activación y Cierre Automático:**
   - Al marcar la campaña como **ACTIVA** o al llegar la fecha programada, la tienda adopta el tema, la portada y las promociones automáticamente.
   - Al finalizar o pausar la campaña, **la tienda vuelve instantáneamente a la portada base y a los precios normales de lista**, sin dejar residuos de precios modificados a mano.

---

### 2. Jerarquía y Orden Estricto de Aplicación de Descuentos

Para garantizar coherencia contable y máxima transparencia hacia la clienta, el motor de precios (\`packages/pricing-engine\`) aplica los descuentos en este orden matemático inmutable:

$$\\text{Precio Base} \\xrightarrow{\\text{1. Promo Ítem}} \\text{Subtotal Ítems} \\xrightarrow{\\text{2. Promo Volumen/Combos}} \\text{Subtotal Carrito} \\xrightarrow{\\text{3. Cupón}} \\text{Subtotal con Cupón} \\xrightarrow{\\text{4. Envío}} \\text{Total} \\xrightarrow{\\text{5. Transferencia (-10\\%)}}\$$

1. **Descuento por Ítem / Promoción de Producto:**
   - Se calcula sobre el precio de lista vigente del producto o variante.
   - Si existen múltiples promociones no acumulables que aplican al mismo ítem, el motor elige automáticamente la que otorga el **mayor ahorro para la compradora**.
2. **Promociones por Cantidad y Reglas de Carrito (2x1, 3x2, Combos):**
   - En reglas 2x1 o 3x2, la unidad bonificada es siempre la de menor valor.
3. **Cupón de Descuento:**
   - Se aplica sobre el subtotal resultante, respetando el mínimo de compra requerido y el tope máximo de descuento configurado.
4. **Cálculo de Envío:**
   - Tarifa fija de envío (\$4.500) o gratis si el subtotal supera el umbral configurado (\$45.000) o si se aplicó un cupón de envío gratis.
5. **Descuento por Medio de Pago (10% Transferencia Bancaria):**
   - Si la clienta abona mediante transferencia (MercadoPago / CBU), se descuenta un **10% adicional acumulable** sobre el total final.
   - El desglose detallado se refleja en el carrito, en el checkout y en el mensaje generado para WhatsApp.

---

### 3. Reglas de Honestidad y Transparencia de Precios (Sin Descuentos Falsos)

En cumplimiento de las normas de lealtad comercial y honestidad al consumidor:

- **Prohibido el "precio tachado" inventado:** En Nocturna no existe ningún campo libre de "precio anterior" o "precio de referencia" editable a mano.
- **Validación con \`PriceHistory\` (Últimos 30 días):** El precio tachado ("antes") **solo se muestra** si coincide estrictamente con un precio real que ese producto o variante tuvo vigente en los últimos 30 días en el historial de precios.
- Si un producto fue creado recientemente o su precio anterior no está verificado en los últimos 30 días, la tienda muestra **únicamente el precio promocional final a pagar**, junto con la etiqueta informativa de la promoción (ej. *20% OFF*), evitando comparativas engañosas.
- **Cuentas regresivas honestas:** Los contadores regresivos se sincronizan contra la fecha y hora reales de finalización (\`endsAt\`). No se utilizan contadores ficticios que se reinician al recargar.
- **Stock real:** Solo se exhiben indicadores de stock auténticos provenientes del inventario del producto.

---

### 4. Cómo Funciona el Historial de Precios (\`PriceHistory\`)

1. Cada vez que un producto o variante cambia de precio mediante el panel de administración o una importación de catálogo, el backend registra un evento inmutable en la tabla \`PriceHistory\`:
   - \`productId\`, \`variantId\`, \`oldPrice\`, \`newPrice\`, \`changedAt\`.
2. La función de enriquecimiento \`enrichProductWithPricing()\` consulta las entradas de \`PriceHistory\` de los últimos 30 días (\`DEFAULT_PRICE_HISTORY_DAYS\`).
3. Si el precio regular actual coincide con el precio previo registrado dentro de la ventana de 30 días, se habilita la exhibición del precio anterior tachado (\`compareAtPrice\`). De lo contrario, se omite.

---

### 5. Panel de Métricas y Atribución UTM (\`/admin/marketing\`)

El panel de marketing permite auditar el impacto comercial en tiempo real:

- **Tarjetas KPI Globales:** Ingresos brutos, pedidos confirmados, unidades totales vendidas, total de descuentos otorgados y ticket promedio del período.
- **Filtros Temporales:** Hoy, últimos 7 días, últimos 30 días, mes en curso o histórico completo.
- **Rendimiento por Campaña:**
  - Cantidad de visitas a la página de campaña (medición anónima de vistas sin almacenar IPs ni cookies privadas).
  - Pedidos y unidades atribuidas a cada campaña.
  - Tasa de conversión real: $\\frac{\\text{Pedidos}}{\\text{Visitas}} \\times 100$.
  - Ingresos y descuentos otorgados por campaña.
  - Desglose de canales de origen (Instagram, WhatsApp, Meta Ads, Email).
- **Eficacia de Cupones:** Número de redenciones, descuentos concedidos e ingresos generados por cada cupón.
- **Atribución Multicanal UTM:**
  - El sistema captura los parámetros \`utm_source\`, \`utm_medium\` y \`utm_campaign\` en la primera visita del usuario (\`sessionStorage\`) y los vincula de forma transparente al registrar el pedido.
  - Tabla comparativa de ingresos y ticket promedio según la fuente de tráfico.

---

### 6. Newsletter Conforme a la Ley 25.326 de Protección de Datos Personales

- **Consentimiento Libre y Expreso:** El formulario de suscripción incluye una casilla de verificación obligatoria con texto legal claro.
- **Registro Inmutable de Consentimiento:** Se almacena la fecha y hora exacta del otorgamiento (\`consentDate\`).
- **Mecanismo Sencillo de Baja:** Los usuarios pueden solicitar la baja en cualquier momento ingresando su correo en el enlace de desuscripción.
- **Listado y Exportación CSV en el Admin:** La pestaña de Newsletter en \`/admin/marketing\` permite visualizar los suscriptores activos y descargar un archivo CSV con formato UTF-8 (compatible con Excel en español rioplatense).

---

### 7. Meta Píxel y API de Conversiones: Modo Privacidad Estricta

- **Protección de Datos Sensibles:** Dado que se trata de una tienda de bienestar íntimo y artículos para adultos, **bajo ninguna circunstancia se envían a Meta nombres de productos, categorías íntimas, descripciones ni títulos de campañas**.
- **Solo Identificadores Técnicos:** Los eventos (\`ViewContent\`, \`AddToCart\`, \`InitiateCheckout\`, \`Purchase\`) transmiten únicamente el SKU/ID numérico, el valor real pagado en Pesos Argentinos (\`currency: 'ARS'\`) y el ID numérico de campaña si existe.
- **Desactivación Total en Modo Demo:** En modo demo (\`VITE_DEMO_MODE=true\`) o si la clave del píxel no está configurada, el script de Meta jamás se ejecuta ni envía peticiones externas.

---

### 8. Restablecimiento del Modo Demo (\`Reset Demo\`)

El botón de **"Restablecer Demo"** disponible en la barra superior o pie de página limpia el estado local (\`nocturna-demo-state\`, carrito, tokens y atribución UTM en \`sessionStorage\`) y vuelve a cargar los datos semilla de prueba completos (campañas, cupones, promociones, secciones de portada, órdenes y suscriptores de ejemplo).

---
`;

let content = fs.readFileSync('README.md', 'utf8');
const startIdx = content.indexOf('## Módulo de Marketing y Campañas');
const endIdx = content.indexOf('## Stack Tecnológico');

if (startIdx !== -1 && endIdx !== -1) {
  content = content.slice(0, startIdx) + comprehensiveGuide + content.slice(endIdx);
  fs.writeFileSync('README.md', content, 'utf8');
  console.log('Successfully updated README.md with comprehensive Marketing & Campaign Guide');
} else {
  console.log('Could not find section bounds in README.md');
}
