# Reporte de Imágenes de Productos y Marca — Paola Calzados

Generado automáticamente mediante `npm run images:report`.

---

## Cómo Cargar Nuevas Imágenes de Productos

1. Guardá las fotos originales en la carpeta `images-source/products/` usando como nombre de archivo el **SKU exacto** del producto o variante que figura en las tablas de abajo:
   - Ejemplo imagen principal: `ZAP-URB-01B.jpg`, `SAN-BAJ-01N.png`, `MUJ-BOT-01N.webp`
   - Ejemplo galería adicional (opcional): `ZAP-URB-01B-2.jpg`, `ZAP-URB-01B-3.jpg`
2. Ejecutá en la terminal:
   ```bash
   npm run images:build
   npm run images:report
   ```
3. El script `images:build` convierte cada imagen a WebP en `frontend/public/images/products/{SKU}.webp` (`800 px`) y `{SKU}-thumb.webp` (`400 px`), y actualiza `frontend/src/api/demo/images-manifest.json`.
4. Si un producto tiene variantes (por ejemplo distintos colores) y subís la foto de cada SKU de variante (`ZAP-URB-01B.jpg`, `ZAP-URB-01N.jpg`), la ficha de producto cambia automáticamente la foto al elegir esa variante. Si solo subís la foto de una variante o del SKU del producto, todas las demás variantes usan esa foto como respaldo. Cuando un producto no tiene foto cargada, la tienda muestra automáticamente el `ProductPlaceholder` de Paola Calzados.

---

## 1. Imágenes de Marca (Opcionales y Principales)

| Archivo Destino | Fuente Opcional | Medidas Recomendadas | Estado Actual |
|-----------------|-----------------|----------------------|---------------|
| `frontend/public/images/brand/hero.webp` | `images-source/brand/hero.jpg` | `1400 x 1050 px` (4:3, WebP < 300 KB) | ⏳ Sin foto (usa visual CSS/SVG) |
| `frontend/public/images/brand/hero-mobile.webp` | `images-source/brand/hero-mobile.jpg` | `800 x 600 px` (4:3, WebP < 150 KB) | ⏳ Sin foto (usa visual CSS/SVG) |
| `frontend/public/images/brand/about.webp` | `images-source/brand/about.jpg` | `1200 x 900 px` (proporción 4:3, estética luminosa rosa/fucsia) | ⏳ Sin foto (usa composición de marca en código) |
| `frontend/public/images/brand/og-image.png` | *(Generada por script)* | `1200 x 630 px` (Open Graph / Redes) | ✅ Generada (1200x630 PNG) |

---

## 2. Catálogo de Demostración (`catalogo_demo.csv`)

- **Total de filas (productos/variantes):** 40
- **Con foto:** 0
- **Sin foto (usan `ProductPlaceholder`):** 40

| # | SKU | Producto / Grupo | Variante | Archivo Esperado | Estado |
|---|-----|------------------|----------|------------------|--------|
| 1 | `ZAP-URB-01B` | Zapatilla Urbana Clásica | Blanco | `images-source/products/ZAP-URB-01B.jpg / .png / .webp` | ⏳ Sin foto |
| 2 | `ZAP-URB-01N` | Zapatilla Urbana Clásica | Negro | `images-source/products/ZAP-URB-01N.jpg / .png / .webp` | ⏳ Sin foto |
| 3 | `ZAP-URB-01F` | Zapatilla Urbana Clásica | Fucsia | `images-source/products/ZAP-URB-01F.jpg / .png / .webp` | ⏳ Sin foto |
| 4 | `ZAP-PLT-02C` | Zapatilla Plataforma Baja | Crudo | `images-source/products/ZAP-PLT-02C.jpg / .png / .webp` | ⏳ Sin foto |
| 5 | `ZAP-PLT-02N` | Zapatilla Plataforma Baja | Negro | `images-source/products/ZAP-PLT-02N.jpg / .png / .webp` | ⏳ Sin foto |
| 6 | `ZAP-LON-03N` | Zapatilla Lona Acordonada | Negro | `images-source/products/ZAP-LON-03N.jpg / .png / .webp` | ⏳ Sin foto |
| 7 | `ZAP-DEP-04G` | Zapatilla Running Liviana | Gris | `images-source/products/ZAP-DEP-04G.jpg / .png / .webp` | ⏳ Sin foto |
| 8 | `ZAP-DEP-04R` | Zapatilla Running Liviana | Rosa | `images-source/products/ZAP-DEP-04R.jpg / .png / .webp` | ⏳ Sin foto |
| 9 | `ZAP-DEP-05N` | Zapatilla Deportiva Sin Cordones | Negro | `images-source/products/ZAP-DEP-05N.jpg / .png / .webp` | ⏳ Sin foto |
| 10 | `ZAP-URB-06S` | Zapatilla Urbana Combinada | Suela | `images-source/products/ZAP-URB-06S.jpg / .png / .webp` | ⏳ Sin foto |
| 11 | `SAN-BAJ-01N` | Sandalia Dos Hebillas | Negro | `images-source/products/SAN-BAJ-01N.jpg / .png / .webp` | ⏳ Sin foto |
| 12 | `SAN-BAJ-01R` | Sandalia Dos Hebillas | Rosa | `images-source/products/SAN-BAJ-01R.jpg / .png / .webp` | ⏳ Sin foto |
| 13 | `SAN-BAJ-02B` | Sandalia Tiras Cruzadas | Beige | `images-source/products/SAN-BAJ-02B.jpg / .png / .webp` | ⏳ Sin foto |
| 14 | `SAN-BAJ-03P` | Sandalia Chata Minimal | Plateado | `images-source/products/SAN-BAJ-03P.jpg / .png / .webp` | ⏳ Sin foto |
| 15 | `SAN-OJO-04F` | Ojota Faja Ancha | Fucsia | `images-source/products/SAN-OJO-04F.jpg / .png / .webp` | ⏳ Sin foto |
| 16 | `SAN-OJO-04N` | Ojota Faja Ancha | Negro | `images-source/products/SAN-OJO-04N.jpg / .png / .webp` | ⏳ Sin foto |
| 17 | `SAN-OJO-05B` | Ojota Anatómica Unisex | Blanco | `images-source/products/SAN-OJO-05B.jpg / .png / .webp` | ⏳ Sin foto |
| 18 | `SAN-BAS-06B` | Sandalia Plataforma Corcho | Beige | `images-source/products/SAN-BAS-06B.jpg / .png / .webp` | ⏳ Sin foto |
| 19 | `SAN-BAS-07N` | Sandalia Taco Cuadrado | Negro | `images-source/products/SAN-BAS-07N.jpg / .png / .webp` | ⏳ Sin foto |
| 20 | `SAN-BAS-07F` | Sandalia Taco Cuadrado | Fucsia | `images-source/products/SAN-BAS-07F.jpg / .png / .webp` | ⏳ Sin foto |
| 21 | `MUJ-BOT-01N` | Borcego Mujer Base Tractor | Negro | `images-source/products/MUJ-BOT-01N.jpg / .png / .webp` | ⏳ Sin foto |
| 22 | `MUJ-BOT-01B` | Borcego Mujer Base Tractor | Borgoña | `images-source/products/MUJ-BOT-01B.jpg / .png / .webp` | ⏳ Sin foto |
| 23 | `MUJ-BOT-02S` | Bota Caña Corta Elastizada | Suela | `images-source/products/MUJ-BOT-02S.jpg / .png / .webp` | ⏳ Sin foto |
| 24 | `MUJ-MOC-03N` | Mocasín Mujer Cadena | Negro | `images-source/products/MUJ-MOC-03N.jpg / .png / .webp` | ⏳ Sin foto |
| 25 | `MUJ-ZAP-04U` | Stiletto Punta Fina | Nude | `images-source/products/MUJ-ZAP-04U.jpg / .png / .webp` | ⏳ Sin foto |
| 26 | `MUJ-PLT-05N` | Sueco Plataforma Mujer | Negro | `images-source/products/MUJ-PLT-05N.jpg / .png / .webp` | ⏳ Sin foto |
| 27 | `HOM-BOR-01N` | Borcego Hombre Clásico | Negro | `images-source/products/HOM-BOR-01N.jpg / .png / .webp` | ⏳ Sin foto |
| 28 | `HOM-BOR-01M` | Borcego Hombre Clásico | Marrón | `images-source/products/HOM-BOR-01M.jpg / .png / .webp` | ⏳ Sin foto |
| 29 | `HOM-BOR-02G` | Bota Urbana Hombre Cuero Sintético | Gris | `images-source/products/HOM-BOR-02G.jpg / .png / .webp` | ⏳ Sin foto |
| 30 | `HOM-MOC-03A` | Mocasín Hombre Casual | Azul Marino | `images-source/products/HOM-MOC-03A.jpg / .png / .webp` | ⏳ Sin foto |
| 31 | `HOM-NAU-04S` | Náutico Hombre Acordonado | Suela | `images-source/products/HOM-NAU-04S.jpg / .png / .webp` | ⏳ Sin foto |
| 32 | `NIN-ESC-01N` | Zapato Escolar Niño Velcro | Negro | `images-source/products/NIN-ESC-01N.jpg / .png / .webp` | ⏳ Sin foto |
| 33 | `flexible y fácil de calzar con abrojo y cordón elástico.` | Zapatilla Infantil Abrojo | NIN-DEP-02A • Azul | `images-source/products/flexible y fácil de calzar con abrojo y cordón elástico..jpg / .png / .webp` | ⏳ Sin foto |
| 34 | `flexible y fácil de calzar con abrojo y cordón elástico.-2` | Zapatilla Infantil Abrojo | NIN-DEP-02N • Negro | `images-source/products/flexible y fácil de calzar con abrojo y cordón elástico.-2.jpg / .png / .webp` | ⏳ Sin foto |
| 35 | `NIN-DEP-03G` | Zapatilla Niños Bota Urbana | Gris | `images-source/products/NIN-DEP-03G.jpg / .png / .webp` | ⏳ Sin foto |
| 36 | `NNA-GUI-01N` | Guillermina Escolar Niña | Negro | `images-source/products/NNA-GUI-01N.jpg / .png / .webp` | ⏳ Sin foto |
| 37 | `NNA-GUI-02R` | Guillermina Charol Fiesta | Rosa | `images-source/products/NNA-GUI-02R.jpg / .png / .webp` | ⏳ Sin foto |
| 38 | `NNA-BOT-03F` | Botita Urbana Niña | Fucsia | `images-source/products/NNA-BOT-03F.jpg / .png / .webp` | ⏳ Sin foto |
| 39 | `NNA-ZAP-04L` | Zapatilla Niña Luces Liviana | Con luces • 27500 | `images-source/products/NNA-ZAP-04L.jpg / .png / .webp` | ⏳ Sin foto |
| 40 | `NNA-PAN-05R` | Panchita Niña Estampada | Estampada • 16500 | `images-source/products/NNA-PAN-05R.jpg / .png / .webp` | ⏳ Sin foto |

---

## 3. Catálogo Principal (`catalogo_paola.csv`)

- **Total de filas (productos/variantes):** 3
- **Con foto:** 0
- **Sin foto (usan `ProductPlaceholder`):** 3

| # | SKU | Producto / Grupo | Variante | Archivo Esperado | Estado |
|---|-----|------------------|----------|------------------|--------|
| 1 | `PAO-EJ-001` | Zapatilla Urbana Modelo Base | Blanco | `images-source/products/PAO-EJ-001.jpg / .png / .webp` | ⏳ Sin foto |
| 2 | `PAO-EJ-002` | Zapatilla Urbana Modelo Base | Negro | `images-source/products/PAO-EJ-002.jpg / .png / .webp` | ⏳ Sin foto |
| 3 | `PAO-EJ-003` | Sandalia Faja Ejemplo | Rosa | `images-source/products/PAO-EJ-003.jpg / .png / .webp` | ⏳ Sin foto |
