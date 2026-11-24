# Nocturna SexShop — Tienda Online en Córdoba

Ecommerce oficial de **Nocturna SexShop** (`@nocturna.sexshop.cba`, Córdoba, Argentina). Diseñado con estética de boutique íntima nocturna, control de mayoría de edad (`+18`), catálogo jerárquico con categorías y subcategorías, soporte completo de variantes por producto, carrito persistente, checkout confidencial por WhatsApp, integración privada con Píxel de Meta + API de Conversiones (CAPI), panel de administración y **Modo Demo autónomo en el navegador (`VITE_DEMO_MODE=true`)** listo para publicar en Vercel sin servidor ni base de datos online.

---

## Datos del Negocio y Configuración de Marca

- **Nombre comercial:** Nocturna SexShop
- **Instagram:** [@nocturna.sexshop.cba](https://www.instagram.com/nocturna.sexshop.cba/)
- **WhatsApp de pedidos y atención:** `+54 9 3517 57-2841` (formato `wa.me` y variable `WHATSAPP_PHONE`: `5493517572841`)
- **Ubicación:** Córdoba, Argentina
- **Placeholders pendientes de confirmar con el cliente** (centralizados en `frontend/src/config/theme.js`):
  - `[EMAIL]` — Correo electrónico de contacto
  - `[HORARIOS]` — Días y horarios de atención / entregas
  - `[ZONA DE ENTREGA]` — Cobertura de cadetería en Córdoba y alrededores
  - `[RAZÓN SOCIAL]` — Titular o razón social para facturación y legales

---

## Modo Demo en Vercel (Sin Backend ni Base de Datos Online)

La tienda cuenta con un **Modo Demostración 100% client-side** (`VITE_DEMO_MODE=true`) implementado como un adaptador de Axios en `frontend/src/api/demo/demoAdapter.js`. Cuando está activo, intercepta todas las llamadas de `frontend/src/api/client.js` y las resuelve en el navegador usando `frontend/src/api/demo/demo-data.json` y `localStorage` (`nocturna-demo-state`).

### Características del Modo Demo
- **Catálogo de demostración (`demo-data.json`):** Generado a partir de `catalogo_demo.csv` mediante `npm run demo:build-data` (30 productos activos, 6 marcados como destacados para la Home, 54 variantes con stock inicial de 10 unidades por variante y `ProductPlaceholder` de marca).
- **Persistencia local (`nocturna-demo-state`):** Los productos creados o editados, categorías, pedidos realizados, sesión activa y carrito se guardan en `localStorage` del navegador.
- **Restablecer demo:** Botón **"Restablecer demo"** disponible en el banner fijo inferior, en el pie de página (`Footer`) y en la cabecera/barra lateral del panel `/admin` para borrar el estado local y volver a los datos originales de `demo-data.json`.
- **Credenciales del Panel Admin (`/admin`) en Modo Demo:**
  - **Usuario:** `admin@nocturna.demo`
  - **Contraseña:** `demo1234`
- **Subida de imágenes en el Admin Demo:** Acepta archivos de imagen desde el navegador y los redimensiona automáticamente en un `<canvas>` (máx. `800px`, JPEG calidad `0.78`) guardándolos como Data URL liviana para no saturar `localStorage`.
- **Checkout a WhatsApp:** Guarda el pedido en el estado local (visible en `/admin/pedidos` con cambio de estado), descuenta el stock de la variante elegida y genera el link a WhatsApp usando `VITE_DEMO_WHATSAPP` (por defecto `5493517572841`).
- **Meta Pixel y CAPI desactivados:** En modo demo no se inyecta `fbevents.js` ni se emiten eventos publicitarios.

### Cómo desplegar la Demo en Vercel

1. Subí este repositorio a GitHub.
2. En [Vercel](https://vercel.com), creá un nuevo proyecto (**Add New → Project**) e importá el repositorio.
3. Configurá los parámetros de compilación del proyecto:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. En **Environment Variables**, agregá:
   - `VITE_DEMO_MODE` = `true`
   - `VITE_DEMO_WHATSAPP` = `5493517572841` *(opcional, ya toma `5493517572841` por defecto)*
5. Hacé clic en **Deploy**. `frontend/vercel.json` ya incluye las reglas de `rewrites` hacia `/index.html` para que todas las rutas de React Router (`/catalogo`, `/producto/:id`, `/admin`, etc.) funcionen al recargar.

### Cómo regenerar los datos de la Demo (`demo-data.json`)

Si modificás el archivo `catalogo_demo.csv` en la raíz del proyecto, regenerá `frontend/src/api/demo/demo-data.json` ejecutando:

```bash
npm run demo:build-data
```

---

## Sistema de Imágenes de Productos y Marca

El proyecto incluye un pipeline estático e idempotente para procesar fotografías de productos por código `SKU` sin depender de servicios externos.

### 1. Convención de archivos fuente (`images-source/`)
- Colocá las fotos originales en `images-source/products/` nombradas exactamente con el **SKU** del producto o de la variante tal como figura en el CSV (por ejemplo: `204.jpg`, `4580.png`, `145R.webp`, `145N.jpg`).
- Para **galería adicional** de un mismo SKU, agregá sufijos numéricos: `{SKU}-2.jpg`, `{SKU}-3.png`, etc.
- Para imágenes opcionales de marca, colocalas en `images-source/brand/` (`hero.jpg`, `about.jpg`).
- La carpeta `images-source/` (excepto sus `.gitkeep`) está en `.gitignore` para no subir archivos crudos pesados al repositorio; en cambio, los WebP optimizados de `frontend/public/images/` y el manifiesto `frontend/src/api/demo/images-manifest.json` **sí se commitean** para que funcionen directamente en Vercel.

### 2. Comandos de procesamiento y reporte
Desde la raíz del proyecto (o desde `frontend/`):

```bash
# Optimizar imágenes con sharp (genera {SKU}.webp de 800px, {SKU}-thumb.webp de 400px y images-manifest.json)
npm run images:build

# Generar el reporte IMAGENES-PENDIENTES.md cruzando catalogo_demo.csv y catalogo_nocturna.csv contra las imágenes cargadas
npm run images:report
```

### 3. Regla de resolución en el Frontend
- El helper `frontend/src/utils/productImages.js` resuelve las imágenes en este orden de prioridad:
  1. Imagen de la **variante activa** por su `SKU` (permite que al cambiar de variante/color en la ficha del producto cambie la foto automáticamente).
  2. Imagen base del **producto** por su `SKU` principal.
  3. Si no existe foto para ese SKU, se renderiza el componente `<ProductPlaceholder />` de marca.
- En **Modo Demo (`VITE_DEMO_MODE=true`)** se consulta directamente `frontend/src/api/demo/images-manifest.json` (más cualquier imagen subida en caliente desde el panel Admin en `localStorage`).
- En **Modo Producción Real** se prioriza `imageUrl` (Cloudinary) si el producto la tiene cargada en base de datos, y se usa el manifiesto estático por SKU como respaldo automático.

### Cómo pasar luego de Modo Demo a Modo Producción Real

Cuando el cliente apruebe la tienda y se despliegue el backend real (`Express + Prisma + PostgreSQL`):

1. En las variables de entorno del proyecto en Vercel (**Settings → Environment Variables**):
   - Eliminá `VITE_DEMO_MODE` (o cambiala a `false`).
   - Definí `VITE_API_URL` con la URL pública del backend (por ejemplo, `https://api.nocturnasexshop.com/api`).
   - *(Opcional)* Definí `VITE_META_PIXEL_ID` si se desea activar el Píxel de Meta en navegador.
2. Hacé un **Redeploy** en Vercel. Sin `VITE_DEMO_MODE=true`, `frontend/src/api/client.js` deja de usar el adaptador de demo y se conecta directamente a la API real sin tocar una sola línea de código.

---

## Módulo de Marketing, Campañas y Motor de Precios (Guía Completa para la Administradora)

El módulo de **Marketing y Campañas** de Nocturna SexShop es una solución integral y transparente para planificar, publicar y medir campañas comerciales (Black Friday, Cyber Sale, Día de la Madre, San Valentín, Navidad, Liquidación de temporada o campañas neutras), con paridad al 100% entre el **Modo Demo en navegador** y el **Backend PostgreSQL**.

---

### 1. Guía Paso a Paso: "Cómo armar una Campaña en Tienda Nocturna"

La administradora gestiona las campañas desde el panel en `/admin/campanas`:

1. **Crear o Editar Campaña:**
   - Hacer clic en **"+ Nueva Campaña"** en `/admin/campanas` para abrir el asistente guiado.
   - **Datos Generales:** Nombre (ej. *Black Friday Nocturna*), slug de URL amigable (ej. `black-friday`), fechas de inicio y fin en zona horaria `America/Argentina/Cordoba`.
   - **Tema Visual y Estilo:** Seleccionar la paleta temática (`black-friday` dorado/ámbar, `cyber-sale` neón cian, `dia-de-la-madre` rosa suave, `san-valentin` carmesí romántico, `navidad` esmeralda/oro, `liquidacion` violeta/fucsia o `neutro`).
   - **Textos de Comunicación:** Título principal, subtítulo, condiciones legales de la promoción y texto de la barra de anuncios superior.
   - **Cuenta Regresiva:** Activar el temporizador con la fecha/hora real de finalización.

2. **Asociar Promociones y Reglas de Descuento:**
   - Descuento porcentual en categorías completas (ej. *20% OFF en Lencería*).
   - Precio promocional fijo para productos destacados.
   - Promociones por cantidad: **2x1**, **3x2** o *2do al 50%* en productos seleccionados.
   - Definir si son acumulables o si gana el mayor beneficio para el cliente.

3. **Crear Cupones Exclusivos (Opcional):**
   - Desde el paso de cupones o en `/admin/cupones`, crear códigos como `BLACKFRIDAY`, `NOCTURNA10` o `ENVIOGRATIS`.
   - Configurar tipo (porcentaje, monto fijo en ARS o envío gratis), monto mínimo de compra y tope máximo de descuento.

4. **Diseñar la Portada de la Campaña (`/admin/portada`):**
   - En el constructor visual de portada, seleccionar la campaña creada.
   - Podés aplicar una plantilla recomendada con 1 clic (ej. *Plantilla Black Friday*) o agregar/reordenar secciones:
     - Hero promocional con imagen erótica sutil y botones de llamada a la acción.
     - Barra de cuenta regresiva activa.
     - Grillas de productos con insignia de oferta.
     - Colecciones temáticas (Fantasías, Lencería, Cosmética).
     - Bloque de suscripción al Newsletter.

5. **Vista Previa en Tiempo Real:**
   - Utilizar el botón **"Ver vista previa"** con el parámetro seguro `?preview=<id>` para revisar cómo se verá la portada completa de la tienda y la página dedicada (`/campanas/:slug`) antes de activarla.

6. **Compartir con Enlaces UTM y Códigos QR (100% Offline):**
   - En la tarjeta de la campaña, presionar el botón **"Compartir & QR"**.
   - Se abrirá la ventana con los enlaces prearmados para cada canal:
     - **Instagram (Bio/Historias):** `...?utm_source=instagram&utm_medium=social&utm_campaign=:slug`
     - **WhatsApp (Difusión/Chat):** `...?utm_source=whatsapp&utm_medium=chat&utm_campaign=:slug`
     - **Meta Ads (Publicidad paga):** `...?utm_source=facebook&utm_medium=cpc&utm_campaign=:slug`
     - **Email / Newsletter:** `...?utm_source=newsletter&utm_medium=email&utm_campaign=:slug`
   - Botón de **1-click copy** para copiar cualquier enlace al portapapeles.
   - **Generador de Código QR por código:** Permite visualizar y descargar la imagen PNG del código QR generado de forma 100% local en el navegador (sin servicios de terceros ni fugas de datos), listo para imprimir en packaging, folletos o cartelería local.

7. **Activación y Cierre Automático:**
   - Al marcar la campaña como **ACTIVA** o al llegar la fecha programada, la tienda adopta el tema, la portada y las promociones automáticamente.
   - Al finalizar o pausar la campaña, **la tienda vuelve instantáneamente a la portada base y a los precios normales de lista**, sin dejar residuos de precios modificados a mano.

---

### 2. Jerarquía y Orden Estricto de Aplicación de Descuentos

Para garantizar coherencia contable y máxima transparencia hacia la clienta, el motor de precios (`packages/pricing-engine`) aplica los descuentos en este orden matemático inmutable:

$$\text{Precio Base} \xrightarrow{\text{1. Promo Ítem}} \text{Subtotal Ítems} \xrightarrow{\text{2. Promo Volumen/Combos}} \text{Subtotal Carrito} \xrightarrow{\text{3. Cupón}} \text{Subtotal con Cupón} \xrightarrow{\text{4. Envío}} \text{Total} \xrightarrow{\text{5. Transferencia (-10\%)}}$$

1. **Descuento por Ítem / Promoción de Producto:**
   - Se calcula sobre el precio de lista vigente del producto o variante.
   - Si existen múltiples promociones no acumulables que aplican al mismo ítem, el motor elige automáticamente la que otorga el **mayor ahorro para la compradora**.
2. **Promociones por Cantidad y Reglas de Carrito (2x1, 3x2, Combos):**
   - En reglas 2x1 o 3x2, la unidad bonificada es siempre la de menor valor.
3. **Cupón de Descuento:**
   - Se aplica sobre el subtotal resultante, respetando el mínimo de compra requerido y el tope máximo de descuento configurado.
4. **Cálculo de Envío:**
   - Tarifa fija de envío ($4.500) o gratis si el subtotal supera el umbral configurado ($45.000) o si se aplicó un cupón de envío gratis.
5. **Descuento por Medio de Pago (10% Transferencia Bancaria):**
   - Si la clienta abona mediante transferencia (MercadoPago / CBU), se descuenta un **10% adicional acumulable** sobre el total final.
   - El desglose detallado se refleja en el carrito, en el checkout y en el mensaje generado para WhatsApp.

---

### 3. Reglas de Honestidad y Transparencia de Precios (Sin Descuentos Falsos)

En cumplimiento de las normas de lealtad comercial y honestidad al consumidor:

- **Prohibido el "precio tachado" inventado:** En Nocturna no existe ningún campo libre de "precio anterior" o "precio de referencia" editable a mano.
- **Validación con `PriceHistory` (Últimos 30 días):** El precio tachado ("antes") **solo se muestra** si coincide estrictamente con un precio real que ese producto o variante tuvo vigente en los últimos 30 días en el historial de precios.
- Si un producto fue creado recientemente o su precio anterior no está verificado en los últimos 30 días, la tienda muestra **únicamente el precio promocional final a pagar**, junto con la etiqueta informativa de la promoción (ej. *20% OFF*), evitando comparativas engañosas.
- **Cuentas regresivas honestas:** Los contadores regresivos se sincronizan contra la fecha y hora reales de finalización (`endsAt`). No se utilizan contadores ficticios que se reinician al recargar.
- **Stock real:** Solo se exhiben indicadores de stock auténticos provenientes del inventario del producto.

---

### 4. Cómo Funciona el Historial de Precios (`PriceHistory`)

1. Cada vez que un producto o variante cambia de precio mediante el panel de administración o una importación de catálogo, el backend registra un evento inmutable en la tabla `PriceHistory`:
   - `productId`, `variantId`, `oldPrice`, `newPrice`, `changedAt`.
2. La función de enriquecimiento `enrichProductWithPricing()` consulta las entradas de `PriceHistory` de los últimos 30 días (`DEFAULT_PRICE_HISTORY_DAYS`).
3. Si el precio regular actual coincide con el precio previo registrado dentro de la ventana de 30 días, se habilita la exhibición del precio anterior tachado (`compareAtPrice`). De lo contrario, se omite.

---

### 5. Panel de Métricas y Atribución UTM (`/admin/marketing`)

El panel de marketing permite auditar el impacto comercial en tiempo real:

- **Tarjetas KPI Globales:** Ingresos brutos, pedidos confirmados, unidades totales vendidas, total de descuentos otorgados y ticket promedio del período.
- **Filtros Temporales:** Hoy, últimos 7 días, últimos 30 días, mes en curso o histórico completo.
- **Rendimiento por Campaña:**
  - Cantidad de visitas a la página de campaña (medición anónima de vistas sin almacenar IPs ni cookies privadas).
  - Pedidos y unidades atribuidas a cada campaña.
  - Tasa de conversión real: $\frac{\text{Pedidos}}{\text{Visitas}} \times 100$.
  - Ingresos y descuentos otorgados por campaña.
  - Desglose de canales de origen (Instagram, WhatsApp, Meta Ads, Email).
- **Eficacia de Cupones:** Número de redenciones, descuentos concedidos e ingresos generados por cada cupón.
- **Atribución Multicanal UTM:**
  - El sistema captura los parámetros `utm_source`, `utm_medium` y `utm_campaign` en la primera visita del usuario (`sessionStorage`) y los vincula de forma transparente al registrar el pedido.
  - Tabla comparativa de ingresos y ticket promedio según la fuente de tráfico.

---

### 6. Newsletter Conforme a la Ley 25.326 de Protección de Datos Personales

- **Consentimiento Libre y Expreso:** El formulario de suscripción incluye una casilla de verificación obligatoria con texto legal claro.
- **Registro Inmutable de Consentimiento:** Se almacena la fecha y hora exacta del otorgamiento (`consentDate`).
- **Mecanismo Sencillo de Baja:** Los usuarios pueden solicitar la baja en cualquier momento ingresando su correo en el enlace de desuscripción.
- **Listado y Exportación CSV en el Admin:** La pestaña de Newsletter en `/admin/marketing` permite visualizar los suscriptores activos y descargar un archivo CSV con formato UTF-8 (compatible con Excel en español rioplatense).

---

### 7. Meta Píxel y API de Conversiones: Modo Privacidad Estricta

- **Protección de Datos Sensibles:** Dado que se trata de una tienda de bienestar íntimo y artículos para adultos, **bajo ninguna circunstancia se envían a Meta nombres de productos, categorías íntimas, descripciones ni títulos de campañas**.
- **Solo Identificadores Técnicos:** Los eventos (`ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`) transmiten únicamente el SKU/ID numérico, el valor real pagado en Pesos Argentinos (`currency: 'ARS'`) y el ID numérico de campaña si existe.
- **Desactivación Total en Modo Demo:** En modo demo (`VITE_DEMO_MODE=true`) o si la clave del píxel no está configurada, el script de Meta jamás se ejecuta ni envía peticiones externas.

---

### 8. Restablecimiento del Modo Demo (`Reset Demo`)

El botón de **"Restablecer Demo"** disponible en la barra superior o pie de página limpia el estado local (`nocturna-demo-state`, carrito, tokens y atribución UTM en `sessionStorage`) y vuelve a cargar los datos semilla de prueba completos (campañas, cupones, promociones, secciones de portada, órdenes y suscriptores de ejemplo).

---
## Stack Tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 18, Vite 4, TailwindCSS 3, React Router v6, Axios, React Icons |
| **Backend** | Node.js (ESM), Express, Prisma ORM, Zod, Helmet, Express Rate Limit, Multer |
| **Base de Datos** | PostgreSQL (`prisma/schema.prisma`) + `docker-compose.yml` para entorno local |
| **Almacenamiento** | Cloudinary (`folder: nocturna-sexshop`) |
| **Analítica / Ads** | Meta Pixel (navegador) + Meta Conversions API / CAPI (servidor) en modo privacidad estricta |

---

## Sistema de Diseño y Paleta (Tema Oscuro)

Los colores están definidos como tokens semánticos en `frontend/tailwind.config.js` y `frontend/src/index.css`:

| Token Tailwind | Hex | Uso |
|----------------|-----|-----|
| `canvas` | `#0F0A0A` | Fondo principal del sitio |
| `surface` | `#1A1212` | Superficies, tarjetas, modales y tablas |
| `surface-elevated` / `brand-deep` | `#2B1917` | Bordó oscuro para cabeceras, badges e inputs |
| `brand` | `#5A2A2E` | Vino profundo para botones primarios y acentos |
| `mauve` / `border` | `#907878` | Rosa viejo/malva para detalles, estados hover y bordes |
| `content` | `#F2EDE8` | Texto principal (contraste AA sobre fondos oscuros) |
| `content-secondary` | `#B8ABA6` | Texto secundario y descripciones |

- **Tipografías:** **Jost** (pesos 300/400/500, `letter-spacing` amplio para títulos y wordmark) y **DM Sans** (400/500/600 para cuerpo de texto y controles). Sin fuentes serif.
- **Activos de marca:** Logos vectoriales (`frontend/public/brand/logo-horizontal.svg`, `logo-vertical.svg`, `favicon.svg`), referencia (`instagram-profile.jpg`) e íconos PWA/favicons regenerados en `frontend/public/`.

---

## Correr el Backend Real y Base de Datos en Local (Docker + Prisma)

Si querés probar el backend completo (`Express + Prisma + PostgreSQL`) en tu computadora sin depender de servicios externos:

### 1. Levantar PostgreSQL local con Docker

El repositorio incluye un archivo `docker-compose.yml` en la raíz con PostgreSQL 16:

```bash
docker compose up -d
```

Esto inicia un contenedor `nocturna-postgres` en `localhost:5432` con:
- **Usuario:** `nocturna`
- **Contraseña:** `nocturna_local_dev`
- **Base de datos:** `nocturna_sexshop`

### 2. Configurar variables de entorno del Backend (`backend/.env`)

Copiá `.env.example` a `backend/.env`:

```bash
cp .env.example backend/.env
```

Y configurá `DATABASE_URL` para apuntar al contenedor de Docker:

```env
DATABASE_URL="postgresql://nocturna:nocturna_local_dev@localhost:5432/nocturna_sexshop?schema=public"
JWT_ACCESS_SECRET="secreto_local_desarrollo_access_123456"
JWT_REFRESH_SECRET="secreto_local_desarrollo_refresh_123456"
WHATSAPP_PHONE="5493517572841"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
ADMIN_EMAIL="admin@nocturna.local"
ADMIN_PASSWORD="admin_local_password"
```

### 3. Instalar dependencias, migrar, crear admin e importar el catálogo

```bash
# 1. Instalar dependencias de raíz, backend y frontend
npm run install:all

# 2. Generar cliente Prisma y aplicar migraciones en PostgreSQL
cd backend
npx prisma generate
npx prisma migrate deploy

# 3. Crear usuario administrador inicial (usa ADMIN_EMAIL y ADMIN_PASSWORD de backend/.env)
npm run seed

# 4. Importar el catálogo completo (400 filas de catalogo_nocturna.csv)
npm run import:catalog
cd ..
```

### 4. Iniciar Backend y Frontend en modo real

Asegurate de que `VITE_DEMO_MODE` **no** esté en `true` en `frontend/.env` y abrí dos terminales:

```bash
# Terminal 1 — Backend (http://localhost:3001)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

---

## Variables de Entorno de Referencia

### `frontend/.env.example`

| Variable | Descripción | Valor por defecto / Ejemplo |
|----------|-------------|-----------------------------|
| `VITE_DEMO_MODE` | Activa el Modo Demo sin backend (`true` / `false`) | `true` (en demo Vercel) / sin definir en modo real |
| `VITE_DEMO_WHATSAPP` | Número de WhatsApp receptor en Modo Demo | `5493517572841` |
| `VITE_API_URL` | URL base del backend real (cuando no está en modo demo) | `/api` o `http://localhost:3001/api` |
| `VITE_META_PIXEL_ID` | ID del Píxel de Meta (ignorado en modo demo) | `""` |

### `.env.example` (para `backend/.env`)

| Variable | Descripción | Ejemplo / Valor |
|----------|-------------|-----------------|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://nocturna:nocturna_local_dev@localhost:5432/nocturna_sexshop?schema=public` |
| `JWT_ACCESS_SECRET` | Secreto JWT de acceso (obligatorio en producción) | `[GENERAR_SECRETO_JWT_ACCESS_SEGURO]` |
| `JWT_REFRESH_SECRET` | Secreto JWT de refresco (obligatorio en producción) | `[GENERAR_SECRETO_JWT_REFRESH_SEGURO]` |
| `JWT_ACCESS_EXPIRATION` | Duración del access token | `15m` |
| `JWT_REFRESH_EXPIRATION` | Duración del refresh token | `7d` |
| `WHATSAPP_PHONE` | Número de WhatsApp receptor de órdenes | `5493517572841` |
| `PORT` | Puerto del servidor backend | `3001` |
| `CORS_ORIGIN` | Origen permitido del frontend | `http://localhost:5173` |
| `ADMIN_EMAIL` | Email del usuario administrador inicial | `[EMAIL_ADMIN]` |
| `ADMIN_PASSWORD` | Contraseña del administrador inicial | `[PASSWORD_ADMIN_SEGURO]` |
| `CLOUDINARY_CLOUD_NAME` | Cloud name de Cloudinary | `[CLOUDINARY_CLOUD_NAME]` |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary | `[CLOUDINARY_API_KEY]` |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary | `[CLOUDINARY_API_SECRET]` |
| `META_PIXEL_ID` | ID del Píxel de Meta para CAPI (opcional) | `""` |
| `META_CAPI_ACCESS_TOKEN` | Token de API de Conversiones (opcional) | `""` |

---

## Estructura del Proyecto

```text
sexshop/
├── backend/
│   ├── prisma/
│   │   ├── migrations/                    # Migración PostgreSQL (init_nocturna)
│   │   ├── schema.prisma                  # Modelos User, Category, Product, ProductVariant, Order, OrderItem
│   │   ├── seed.js                        # Creación segura del usuario ADMIN desde variables de entorno
│   │   └── catalog-snapshot.json          # Snapshot generado por import-catalog.js
│   ├── scripts/
│   │   └── import-catalog.js              # Importador idempotente de catalogo_nocturna.csv + generador de REVISAR.md
│   └── src/                               # Servidor Express, controladores, servicios, validadores Zod y Meta CAPI
│
├── frontend/
│   ├── public/                            # Logos SVG, favicons, site.webmanifest, robots.txt, sitemap.xml
│   ├── scripts/
│   │   └── build-demo-data.js             # Generador de src/api/demo/demo-data.json desde catalogo_demo.csv
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js                  # Cliente Axios (conecta a demoAdapter si VITE_DEMO_MODE=true)
│   │   │   └── demo/
│   │   │       ├── demoAdapter.js         # Adaptador Axios client-side completo con localStorage (nocturna-demo-state)
│   │   │       └── demo-data.json         # Datos semilla de la demo (30 productos, 6 destacados, 54 variantes)
│   │   ├── components/
│   │   │   ├── layout/DemoBanner.jsx      # Banner fijo de Modo Demo con credenciales Admin y botón Restablecer demo
│   │   │   └── ...                        # Componentes de catálogo, carrito, checkout, admin y UI
│   │   ├── config/theme.js                # Configuración centralizada de marca, navegación, FAQ, contacto y legales
│   │   └── pages/                         # Home, Catálogo, Producto, Carrito, Checkout, Legal, Login y Panel Admin
│   ├── .env.example                       # Variables de entorno de ejemplo del frontend (incluye VITE_DEMO_MODE)
│   └── vercel.json                        # Rewrites SPA para despliegue en Vercel
│
├── catalogo_demo.csv                      # Catálogo reducido de demostración (54 filas / 30 productos)
├── catalogo_nocturna.csv                  # Catálogo completo normalizado (400 filas)
├── docker-compose.yml                     # Contenedor PostgreSQL 16 local para probar el backend real
├── REVISAR.md                             # Reporte de ítems en borrador, sin precio y SKUs normalizados
├── reporte_verificacion_meta.txt          # Documentación de auditoría de privacidad de Meta Pixel y CAPI
├── .env.example                           # Plantilla de variables de entorno del backend
└── README.md
```
