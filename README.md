# Paola Calzados — Ecommerce (Mayorista y Minorista)

Tienda online para **Paola Calzados** (Córdoba, Argentina · Instagram [`@paola_calzadoss`](https://www.instagram.com/paola_calzadoss/)), dedicada a la venta de calzado **por mayor y por menor** para mujer, hombre, niños y niñas.

Incluye catálogo navegable por categorías y variantes, fichas de producto con selector de variantes y stock real, carrito persistente, checkout optimizado con envío de pedido directo a **WhatsApp**, motor de precios y promociones con historial de 30 días, y un **Panel de Administración (`/admin`)** completo. También cuenta con **Modo Demo client-side** (`VITE_DEMO_MODE=true`) listo para previsualizar en Vercel sin backend ni base de datos.

---

## Arquitectura del Proyecto

```text
paola/
├── frontend/                  # React 18 + Vite + Tailwind CSS + Demo Adapter
│   ├── public/brand/          # Logos placeholder SVG (reemplazables por el logo definitivo)
│   ├── scripts/               # Generación de demo-data.json, reporte de fotos y assets PNG
│   └── src/
│       ├── api/demo/          # demoAdapter.js (localStorage 'paola-demo-state') + demo-data.json
│       ├── components/        # UI reutilizable, BrandLogo, ProductPlaceholder, catálogo, carrito, admin
│       ├── config/theme.js    # Configuración centralizada de marca, textos legales, FAQ y placeholders
│       ├── pages/             # Tienda pública y panel /admin
│       └── pricing-engine/    # Copia sincronizada de packages/pricing-engine
├── backend/                   # Express + Prisma + PostgreSQL
│   ├── prisma/                # schema.prisma, migraciones y seed.js
│   ├── scripts/               # import-catalog.js (lee catalogo_paola.csv)
│   └── src/                   # Controllers, routes, services (incl. WhatsApp y Meta CAPI opcional)
├── packages/pricing-engine/   # Motor compartido de precios, promociones, cupones, campañas y métricas
├── scripts/sync-engine.js     # Verifica y sincroniza packages/pricing-engine con frontend y backend
├── catalogo_demo.csv          # Catálogo temporal de ~30 calzados de ejemplo (precios ficticios)
├── catalogo_paola.csv         # Plantilla base para importar el catálogo real en PostgreSQL
└── docker-compose.yml         # Contenedor PostgreSQL local (paola-postgres / db: paola_calzados)
```

---

## Configuración de Marca y Estética

- **Paleta (Tema Claro)**: Canvas `#FFF7FB`, Surface `#FFFFFF`, Rosa Claro `#FDE4F1`, Fucsia Primario `#E6007E`, Fucsia Profundo `#B80063`, Bordes `#F2C4DD`, Texto Principal `#141014`, Texto Secundario `#6B5A64`. Definida con canales RGB en [frontend/src/index.css](frontend/src/index.css) y [frontend/tailwind.config.js](frontend/tailwind.config.js).
- **Tipografías**: `Poppins` (400/500/600/700) para cuerpo y títulos, y `Pacifico` para el wordmark `<BrandLogo />` y acentos puntuales.
- **Logo y Favicon**:
  - Componente reutilizable en [frontend/src/components/ui/BrandLogo.jsx](frontend/src/components/ui/BrandLogo.jsx) (`"Paola"` en script + `"Calzados"` en bold).
  - Archivos SVG placeholder listos para reemplazar en `frontend/public/brand/logo-horizontal.svg`, `frontend/public/brand/logo-vertical.svg` y `frontend/public/favicon.svg`.
  - Para regenerar favicons e imagen Open Graph (`og-image.png`) ejecutá:
    ```bash
    npm --prefix frontend run brand:build-images
    ```
- **Datos centralizados**: Todo el contenido editable de negocio, categorías destacadas, FAQ, políticas y placeholders vive en [frontend/src/config/theme.js](frontend/src/config/theme.js).

---

## Modo Demo (Vercel / Navegador sin Backend)

Con `VITE_DEMO_MODE=true` la aplicación corre íntegramente en el navegador usando `demoAdapter.js` y el seed `frontend/src/api/demo/demo-data.json`:

- **Clave de estado local**: `localStorage["paola-demo-state"]` (incluye botón **"Restablecer demo"** en el banner superior).
- **Credenciales Admin Demo**:
  - Email: `admin@paolacalzados.demo`
  - Contraseña: `demo1234`
- **WhatsApp en Demo**: si no se configura `VITE_DEMO_WHATSAPP`, usa el número ficticio marcado como TEST (`5493510000000`) para que el flujo de checkout pueda probarse de punta a punta sin errores. El mensaje generado inicia con:
  `"Hola Paola Calzados, quiero hacer este pedido:"`

### Deploy del Modo Demo en Vercel

1. Importar el repositorio en Vercel apuntando al proyecto con `vercel.json` en la raíz (compila `frontend` y sirve `frontend/dist`).
2. Configurar las variables de entorno en Vercel:
   - `VITE_DEMO_MODE=true`
   - `VITE_DEMO_WHATSAPP=5493510000000` *(o el número real confirmado por la clienta)*
   - `VITE_SITE_URL=https://tu-dominio.vercel.app`
3. Ejecutar build / deploy (`npm --prefix frontend run build`).

---

## Instalación y Desarrollo Local

### 1. Instalar dependencias

```bash
npm install
npm --prefix frontend install
npm --prefix backend install
```

### 2. Correr solo Frontend en Modo Demo (rápido)

Creá `frontend/.env` tomando como base `frontend/.env.example`:

```bash
npm run dev:frontend
```

### 3. Correr Stack Completo (Backend + PostgreSQL + Frontend)

1. Levantá PostgreSQL con Docker (`paola-postgres`, base `paola_calzados`):
   ```bash
   docker compose up -d
   ```
2. Copiá `.env.example` a `.env` en `backend/` (o raíz según tu configuración) y completá los valores reales.
3. Aplicá migraciones y datos iniciales:
   ```bash
   npm --prefix backend run prisma:generate
   npm --prefix backend run prisma:migrate
   npm --prefix backend run prisma:seed
   ```
4. Levantá backend y frontend:
   ```bash
   npm run dev:backend
   npm run dev:frontend
   ```

---

## Variables de Entorno

### Frontend (`frontend/.env.example`)

| Variable | Uso | Ejemplo / Default |
|----------|-----|-------------------|
| `VITE_DEMO_MODE` | Activa el adaptador client-side sin backend | `true` o `false` |
| `VITE_DEMO_WHATSAPP` | WhatsApp destino en modo demo | `5493510000000` *(TEST)* |
| `VITE_API_URL` | URL base de API en producción | `/api` |
| `VITE_SITE_URL` | URL pública para enlaces UTM / canonical | `https://paola-calzados.vercel.app` |
| `VITE_META_PIXEL_ID` | Meta Pixel (opcional; vacío = desactivado) | `""` |

### Backend (`.env.example`)

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` | Cadena PostgreSQL (`postgresql://paola:paola_local_dev@localhost:5432/paola_calzados?schema=public`) |
| `PORT` | Puerto HTTP de Express (`4000`) |
| `FRONTEND_URL` | Origen permitido para CORS (`http://localhost:5173`) |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Secretos de firma de tokens |
| `WHATSAPP_PHONE` | Número real de Paola Calzados sin `+` (`[WHATSAPP]`). Si queda vacío o como placeholder, el sistema evita enlaces rotos. |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Subida de fotos a la carpeta `paola-calzados` en Cloudinary |
| `META_PIXEL_ID` / `META_CAPI_ACCESS_TOKEN` / `META_TEST_EVENT_CODE` | Tracking server-side opcional (solo envía IDs/SKUs e importes ARS, sin PII innecesaria) |

---

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run build` | Compila `frontend/dist` para producción |
| `npm test` | Corre tests unitarios de `pricing-engine` y smoke tests de rutas en `frontend` |
| `npm run sync:engine` | Copia `packages/pricing-engine/index.js` hacia `frontend/src` y `backend/src` |
| `npm run sync:engine:check` | Verifica que las copias del motor de precios estén sincronizadas |
| `npm run demo:build-data` | Regenera `frontend/src/api/demo/demo-data.json` a partir de `catalogo_demo.csv` |
| `npm run import:catalog` | Lee `catalogo_paola.csv`, genera `catalog-snapshot.json` y `REVISAR.md`, e importa en PostgreSQL |
| `npm run images:build` | Optimiza imágenes de `images-source/products/` a `.webp` y actualiza `images-manifest.json` |
| `npm run images:report` | Genera `IMAGENES-PENDIENTES.md` con el estado de fotos del catálogo |
| `npm --prefix frontend run brand:build-images` | Genera favicons e imagen Open Graph en `frontend/public/` |

---

## Cómo Pasar a Producción

1. Completar los archivos `catalogo_paola.csv` con los productos reales y cargar las fotos por SKU en `images-source/products/`.
2. Definir todas las variables de entorno en el servidor (`DATABASE_URL`, `JWT_*`, `CLOUDINARY_*`, `WHATSAPP_PHONE`, `FRONTEND_URL`).
3. Ejecutar `npm run import:catalog`, `npm run images:build` y desplegar `frontend` con `VITE_DEMO_MODE=false`.
4. Confirmar y reemplazar todos los placeholders listados abajo antes de publicar la tienda.

---

## Placeholders pendientes de confirmar con la clienta

Antes de salir a producción es necesario pedirle a Paola estos datos para reemplazar los corchetes en [frontend/src/config/theme.js](frontend/src/config/theme.js), `.env` y textos legales:

- **`[WHATSAPP]`** (`WHATSAPP_PHONE` y `VITE_DEMO_WHATSAPP`): número oficial de WhatsApp de pedidos (actualmente usa `5493510000000` marcado como TEST en modo demo).
- **`[EMAIL]`**: casilla oficial de contacto y atención al cliente.
- **`[DIRECCIÓN DEL LOCAL]`**: dirección física o punto de retiro en Córdoba (si corresponde mostrarla).
- **`[HORARIOS]`**: días y horarios de atención al público / WhatsApp / retiros.
- **`[ZONA DE ENVÍO]`**: cobertura de envíos (Córdoba Capital, interior provincial, todo el país por correo/expreso).
- **`[COSTOS Y PLAZOS DE ENVÍO]`**: tarifas o criterios de envío gratis y demoras estimadas.
- **`[MÍNIMO DE COMPRA MAYORISTA]`**: cantidad mínima de pares, curva de talles o monto mínimo para acceder a modalidad mayorista.
- **`[PLAZO DE CAMBIOS]`**: cantidad de días permitidos para gestionar cambios.
- **`[CONDICIONES DE CAMBIO POR TALLE O FALLA]`**: requisitos del calzado (sin uso, caja original, comprobante) y costos de traslado.
- **`[RAZÓN SOCIAL / CUIT]`**: datos fiscales y de titularidad exigidos en Términos y Política de Privacidad.
- **`[TEXTO Y CANAL DE GESTIÓN DEL BOTÓN DE ARREPENTIMIENTO — VERIFICAR NORMATIVA VIGENTE (LEY 24.240 / RES. 424/2020 SCI)]`**: redacción legal revisada y enlace/formulario definitivo para el acceso en Footer (`/legal#arrepentimiento`).
- **Logo definitivo**: reemplazar los SVG placeholder en `frontend/public/brand/` y actualizar `<BrandLogo />` si se usa isotipo oficial, luego correr `npm --prefix frontend run brand:build-images`.
- **Catálogo e imágenes reales**: reemplazar `catalogo_demo.csv` / completar `catalogo_paola.csv` con modelos, talles (Fase 2), precios finales (mayorista/minorista) y fotografías reales.
