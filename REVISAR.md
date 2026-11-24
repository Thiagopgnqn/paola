# REVISAR — Observaciones del Catálogo Paola Calzados

Este documento fue generado automáticamente por el script de importación (`npm run import:catalog`) a partir de `catalogo_paola.csv`.

## Resumen General de Importación

- **Filas totales procesadas en el CSV:** 3
- **Productos únicos (agrupados por columna `grupo`):** 2
- **Filas con `estado = revisar` (cargadas como borrador / inactivas):** 0
- **Filas sin precio (`precio_ars` vacío, cargadas como inactivas):** 0
- **SKUs duplicados renombrados con sufijo único:** 0
- **SKUs vacíos completados con código interno (`PAO-XXXX`):** 0

---

## 1. Filas con `estado = revisar` (Cargadas como Borrador / Inactivas)

| Fila | Grupo / Producto | Variante / Nombre | Categoría | SKU Asignado | Precio | Nota del Catálogo |
|------|------------------|-------------------|-----------|--------------|--------|-------------------|

---

## 2. Filas sin Precio (`precio_ars` vacío — Cargadas como Inactivas)

| Fila | Grupo / Producto | Nombre | Categoría | SKU Asignado | Estado CSV | Nota |
|------|------------------|--------|-----------|--------------|------------|------|

---

## 3. SKUs Duplicados en el Catálogo (Sufijos Aplicados)

En caso de detectarse códigos repetidos entre distintas filas, se asigna un sufijo único para mantener la integridad de la base de datos:

| Fila | SKU Original | SKU Único Asignado | Producto / Grupo | Categoría | Observación |
|------|--------------|--------------------|------------------|-----------|-------------|

---

## 4. Productos sin SKU de Proveedor (Código Interno `PAO-XXXX` Generado)

| Fila | SKU Generado | Grupo | Nombre | Categoría | Nota |
|------|--------------|-------|--------|-----------|------|

---

## 5. Otras Notas e Inferencias en Filas Activas (`estado = ok`)

Estas filas tienen precio y `estado = ok`, pero poseen observaciones en la columna `nota` para validar con el cliente:

| Fila | Producto / Variante | SKU | Nota para confirmar con el cliente |
|------|---------------------|-----|------------------------------------|
| 2 | Zapatilla Urbana Modelo Base Blanca | `PAO-EJ-001` | Fila de ejemplo con PRECIO FICTICIO DE PRUEBA — reemplazar por catálogo real |
| 3 | Zapatilla Urbana Modelo Base Negra | `PAO-EJ-002` | Fila de ejemplo con PRECIO FICTICIO DE PRUEBA — reemplazar por catálogo real |
| 4 | Sandalia Faja Ejemplo Rosa | `PAO-EJ-003` | Fila de ejemplo con PRECIO FICTICIO DE PRUEBA — reemplazar por catálogo real |
