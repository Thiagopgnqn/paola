import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import {
  FiEdit2,
  FiTrash2,
  FiBox,
  FiStar,
  FiCopy,
  FiExternalLink,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiMinus,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import themeConfig from '../../config/theme';
import { resolveProductImage } from '../../utils/productImages';

const formatVariantLabel = (v) => {
  const parts = [v.type, v.size, v.color, v.flavor, v.volume].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : v.sku || 'Variante';
};

const ProductTable = ({
  products,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
  onToggleFeatured,
  onQuickStockChange,
  onVariantStockChange,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
}) => {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleExpand = (productId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const allSelected =
    products.length > 0 &&
    products.every((p) => selectedIds.includes(p.id || p._id));

  if (!products || products.length === 0) {
    return (
      <div className="bg-surface rounded-lg border border-border p-10 text-center">
        <FiBox className="mx-auto text-brand/50 mb-2" size={28} />
        <p className="text-sm font-semibold text-content">
          No se encontraron productos con los filtros actuales
        </p>
        <p className="text-xs text-content-secondary mt-1">
          Probá cambiar los criterios de búsqueda, categoría o estado de stock.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile Card List (screens < 768px) */}
      <div className="md:hidden space-y-3">
        {products.map((product) => {
          const productId = product.id || product._id;
          const priceFormatted = Number(product.price || 0).toLocaleString('es-AR');
          const resolvedImg = resolveProductImage(product);
          const imageUrl =
            resolvedImg?.thumb || resolvedImg?.main || product.imageUrl || product.image;
          const variantCount = Array.isArray(product.variants) ? product.variants.length : 0;
          const totalStock =
            variantCount > 0
              ? product.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0)
              : Number(product.stock || 0);
          const isFeatured = Boolean(product.featured || product.badge === 'Destacado');
          const isActive = product.active !== false;
          const isExpanded = Boolean(expandedRows[productId]);

          return (
            <div
              key={productId}
              onClick={() => onEdit(product)}
              className={`bg-surface p-4 rounded-lg border transition-colors shadow-soft cursor-pointer hover:border-brand ${
                !isActive ? 'border-border-subtle opacity-75' : 'border-border'
              }`}
            >
              <div className="flex items-start gap-3">
                {onToggleSelect && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(productId)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => onToggleSelect(productId)}
                    className="mt-1 rounded border-border-strong bg-surface text-brand focus:ring-brand"
                    aria-label={`Seleccionar ${product.name}`}
                  />
                )}
                <div className="h-14 w-14 flex-shrink-0 bg-surface-elevated rounded border border-border overflow-hidden flex items-center justify-center text-brand-deep relative">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <FiBox size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant={!isActive ? 'cancelled' : 'neutral'}>
                        {!isActive ? 'Pausado' : product.category?.name || 'General'}
                      </Badge>
                      {!imageUrl && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-status-warning-bg text-status-warning border border-status-warning-border font-medium">
                          Sin foto
                        </span>
                      )}
                    </div>
                    {product.sku && (
                      <span className="text-[10px] text-content-secondary font-mono">
                        SKU: {product.sku}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-content truncate hover:text-brand-deep">
                    {product.name}
                  </h4>
                  {variantCount > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(productId);
                      }}
                      className="text-[11px] text-brand-deep font-semibold hover:underline mt-0.5 inline-flex items-center gap-1"
                    >
                      <span>{variantCount} variantes</span>
                      {isExpanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && variantCount > 0 && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="mt-3 pt-2.5 border-t border-border-subtle space-y-1.5"
                >
                  {product.variants.map((v) => (
                    <div
                      key={v.id || v.sku}
                      className="flex items-center justify-between text-xs bg-canvas px-2.5 py-1.5 rounded border border-border"
                    >
                      <div className="truncate pr-2">
                        <span className="font-mono text-[10px] text-brand-deep mr-1.5">
                          [{v.sku}]
                        </span>
                        <span className="text-content">{formatVariantLabel(v)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => onVariantStockChange?.(product, v.id, -1)}
                          className="w-6 h-6 rounded bg-surface-elevated text-content flex items-center justify-center border border-border-strong"
                        >
                          <FiMinus size={10} />
                        </button>
                        <span className="w-8 text-center font-mono text-xs text-content">
                          {v.stock ?? 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => onVariantStockChange?.(product, v.id, 1)}
                          className="w-6 h-6 rounded bg-surface-elevated text-content flex items-center justify-center border border-border-strong"
                        >
                          <FiPlus size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-between mt-3.5 pt-3 border-t border-border-subtle"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-content tracking-tight">
                    {themeConfig.brand.currencySymbol}
                    {priceFormatted}
                  </span>
                  <div className="inline-flex items-center gap-1">
                    {variantCount === 0 && onQuickStockChange && (
                      <button
                        type="button"
                        onClick={() => onQuickStockChange(product, -1)}
                        className="w-5 h-5 rounded bg-surface-elevated text-content hover:bg-brand hover:text-white flex items-center justify-center border border-border-strong"
                        title="Restar 1 al stock"
                      >
                        <FiMinus size={10} />
                      </button>
                    )}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        totalStock > 3
                          ? 'bg-status-success-bg text-status-success border-status-success-border'
                          : totalStock > 0
                          ? 'bg-status-warning-bg text-status-warning border-status-warning-border'
                          : 'bg-status-error-bg text-status-error border-status-error-border'
                      }`}
                    >
                      {totalStock} un.
                    </span>
                    {variantCount === 0 && onQuickStockChange && (
                      <button
                        type="button"
                        onClick={() => onQuickStockChange(product, 1)}
                        className="w-5 h-5 rounded bg-surface-elevated text-content hover:bg-brand hover:text-white flex items-center justify-center border border-border-strong"
                        title="Sumar 1 al stock"
                      >
                        <FiPlus size={10} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {onToggleFeatured && (
                    <button
                      type="button"
                      onClick={() => onToggleFeatured(product)}
                      className={`p-1.5 rounded border transition-colors ${
                        isFeatured
                          ? 'bg-status-warning-bg text-status-warning border-status-warning-border'
                          : 'bg-surface-elevated text-content-secondary border-border-strong'
                      }`}
                      title={isFeatured ? 'Quitar de Destacados' : 'Destacar en Home'}
                    >
                      <FiStar size={13} className={isFeatured ? 'fill-current' : ''} />
                    </button>
                  )}
                  {onToggleActive && (
                    <button
                      type="button"
                      onClick={() => onToggleActive(product)}
                      className="p-1.5 bg-surface-elevated text-content-secondary hover:text-brand-deep rounded border border-border-strong"
                      title={isActive ? 'Pausar publicación' : 'Activar publicación'}
                    >
                      {isActive ? <FiEye size={13} /> : <FiEyeOff size={13} />}
                    </button>
                  )}
                  {onDuplicate && (
                    <button
                      type="button"
                      onClick={() => onDuplicate(product)}
                      className="p-1.5 bg-surface-elevated hover:bg-brand text-content hover:text-white rounded border border-border-strong"
                      title="Duplicar producto"
                    >
                      <FiCopy size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    className="px-2.5 py-1 bg-brand hover:bg-brand-deep text-white rounded transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                    title="Editar producto"
                  >
                    <FiEdit2 size={12} />
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`¿Eliminar ${product.name}?`)) onDelete(productId);
                    }}
                    className="p-1.5 bg-status-error-bg hover:bg-rose-600 text-status-error hover:text-white rounded transition-colors border border-status-error-border"
                    title="Eliminar"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table (screens >= 768px) */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Tabla de inventario de productos"
        className="hidden md:block overflow-x-auto bg-surface rounded-lg border border-border shadow-soft focus:outline-none focus:ring-1 focus:ring-brand"
      >
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-elevated sticky top-0 z-10">
            <tr>
              {onToggleSelect && (
                <th className="px-3 py-3 text-left w-9">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleSelectAll}
                    className="rounded border-border-strong bg-surface text-brand focus:ring-brand cursor-pointer"
                    aria-label="Seleccionar todos los productos de la página"
                  />
                </th>
              )}
              <th className="px-3.5 py-3 text-left text-[11px] font-bold text-content uppercase tracking-wider">
                Calzado / SKU
              </th>
              <th className="px-3.5 py-3 text-left text-[11px] font-bold text-content uppercase tracking-wider">
                Categoría / Variantes
              </th>
              <th className="px-3.5 py-3 text-left text-[11px] font-bold text-content uppercase tracking-wider">
                Precio Lista / Transf.
              </th>
              <th className="px-3.5 py-3 text-left text-[11px] font-bold text-content uppercase tracking-wider">
                Stock Rápido
              </th>
              <th className="px-3.5 py-3 text-center text-[11px] font-bold text-content uppercase tracking-wider">
                Estado
              </th>
              <th className="px-3.5 py-3 text-right text-[11px] font-bold text-content uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {products.map((product) => {
              const productId = product.id || product._id;
              const priceFormatted = Number(product.price || 0).toLocaleString('es-AR');
              const transferFormatted = product.transferPrice
                ? Number(product.transferPrice).toLocaleString('es-AR')
                : null;
              const resolvedImg = resolveProductImage(product);
              const imageUrl =
                resolvedImg?.thumb || resolvedImg?.main || product.imageUrl || product.image;
              const variantCount = Array.isArray(product.variants) ? product.variants.length : 0;
              const totalStock =
                variantCount > 0
                  ? product.variants.reduce((sum, v) => sum + Number(v.stock || 0), 0)
                  : Number(product.stock || 0);
              const isFeatured = Boolean(product.featured || product.badge === 'Destacado');
              const isActive = product.active !== false;
              const isExpanded = Boolean(expandedRows[productId]);
              const isSelected = selectedIds.includes(productId);

              return (
                <React.Fragment key={productId}>
                  <tr
                    onClick={() => onEdit(product)}
                    className={`group hover:bg-surface-elevated/40 transition-colors cursor-pointer ${
                      !isActive ? 'opacity-65 bg-canvas' : ''
                    } ${isSelected ? 'bg-surface-elevated/70' : ''}`}
                    title="Hacé clic para abrir y editar este producto"
                  >
                    {onToggleSelect && (
                      <td
                        className="px-3 py-3 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(productId)}
                          className="rounded border-border-strong bg-surface text-brand focus:ring-brand cursor-pointer"
                          aria-label={`Seleccionar ${product.name}`}
                        />
                      </td>
                    )}
                    <td className="px-3.5 py-3">
                      <div className="flex items-center">
                        <div className="h-11 w-11 flex-shrink-0 bg-surface-elevated rounded border border-border group-hover:border-brand overflow-hidden flex items-center justify-center text-brand-deep relative transition-colors">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt=""
                              className="h-11 w-11 object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <FiBox size={16} />
                          )}
                        </div>
                        <div className="ml-3 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-content group-hover:text-brand-deep group-hover:underline truncate max-w-[210px] transition-colors">
                              {product.name}
                            </span>
                            {product.badge && (
                              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand text-white font-semibold">
                                {product.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-content-secondary font-mono">
                              SKU: {product.sku || 'S/N'}
                            </span>
                            {!imageUrl && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-status-warning-bg text-status-warning border border-status-warning-border font-medium">
                                Sin foto
                              </span>
                            )}
                            {Number(product.soldCount || 0) > 0 && (
                              <span className="text-[10px] text-content-secondary">
                                &bull; {product.soldCount} vend.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="text-xs text-content-secondary font-medium block truncate max-w-[180px]">
                        {product.category?.parent?.name
                          ? `${product.category.parent.name} → ${product.category.name}`
                          : product.category?.name || 'Sin categoría'}
                      </span>
                      {variantCount > 0 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(productId);
                          }}
                          className="text-[11px] text-brand-deep hover:underline inline-flex items-center gap-1 mt-0.5 font-semibold"
                        >
                          <span>
                            {variantCount} variante{variantCount !== 1 ? 's' : ''}
                          </span>
                          {isExpanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                        </button>
                      ) : (
                        <span className="text-[10px] text-content-secondary block mt-0.5">
                          Producto único
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <div className="text-xs font-bold text-content">
                        {themeConfig.brand.currencySymbol}
                        {priceFormatted}
                      </div>
                      {transferFormatted && (
                        <div className="text-[10px] text-status-success font-medium mt-0.5">
                          Transf: {themeConfig.brand.currencySymbol}
                          {transferFormatted}
                        </div>
                      )}
                    </td>
                    <td
                      className="px-3.5 py-3 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        {variantCount === 0 && onQuickStockChange && (
                          <button
                            type="button"
                            onClick={() => onQuickStockChange(product, -1)}
                            disabled={totalStock <= 0}
                            className="w-6 h-6 rounded bg-surface-elevated hover:bg-brand text-content hover:text-white flex items-center justify-center border border-border-strong disabled:opacity-30 transition-colors"
                            title="Restar 1 unidad"
                          >
                            <FiMinus size={11} />
                          </button>
                        )}

                        <span
                          onClick={() => variantCount > 0 && toggleExpand(productId)}
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded border ${
                            variantCount > 0 ? 'cursor-pointer' : ''
                          } ${
                            totalStock > 3
                              ? 'bg-status-success-bg text-status-success border-status-success-border'
                              : totalStock > 0
                              ? 'bg-status-warning-bg text-status-warning border-status-warning-border'
                              : 'bg-status-error-bg text-status-error border-status-error-border'
                          }`}
                          title={
                            variantCount > 0
                              ? 'Hacé clic para ajustar el stock de cada variante'
                              : 'Stock disponible'
                          }
                        >
                          {totalStock === 0 ? 'Agotado (0)' : `${totalStock} un.`}
                        </span>

                        {variantCount === 0 && onQuickStockChange && (
                          <button
                            type="button"
                            onClick={() => onQuickStockChange(product, 1)}
                            className="w-6 h-6 rounded bg-surface-elevated hover:bg-brand text-content hover:text-white flex items-center justify-center border border-border-strong transition-colors"
                            title="Sumar 1 unidad"
                          >
                            <FiPlus size={11} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td
                      className="px-3.5 py-3 whitespace-nowrap text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        {onToggleActive && (
                          <button
                            type="button"
                            onClick={() => onToggleActive(product)}
                            className={`px-2 py-1 rounded text-[10px] font-semibold border transition-colors inline-flex items-center gap-1 ${
                              isActive
                                ? 'bg-status-success-bg text-status-success border-status-success-border hover:bg-emerald-100'
                                : 'bg-surface-elevated text-content-secondary border-border-strong hover:text-content'
                            }`}
                            title={
                              isActive
                                ? 'Visible en tienda (clic para pausar)'
                                : 'Pausado / Borrador (clic para activar)'
                            }
                          >
                            {isActive ? <FiEye size={11} /> : <FiEyeOff size={11} />}
                            <span>{isActive ? 'Activo' : 'Pausado'}</span>
                          </button>
                        )}

                        {onToggleFeatured && (
                          <button
                            type="button"
                            onClick={() => onToggleFeatured(product)}
                            className={`p-1.5 rounded border transition-colors ${
                              isFeatured
                                ? 'bg-status-warning-bg text-status-warning border-status-warning-border'
                                : 'bg-surface text-content-secondary border-border-strong hover:text-brand-deep'
                            }`}
                            title={
                              isFeatured
                                ? 'Destacado en Home (clic para quitar)'
                                : 'Marcar como Destacado en Home'
                            }
                          >
                            <FiStar size={12} className={isFeatured ? 'fill-current' : ''} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td
                      className="px-3.5 py-3 whitespace-nowrap text-right text-xs font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(product)}
                          className="px-2.5 py-1 rounded bg-brand hover:bg-brand-deep text-white inline-flex items-center gap-1 text-[11px] font-semibold transition-colors"
                          title="Editar producto"
                        >
                          <FiEdit2 size={12} />
                          <span>Editar</span>
                        </button>
                        {onDuplicate && (
                          <button
                            type="button"
                            onClick={() => onDuplicate(product)}
                            className="text-content-secondary hover:text-brand-deep p-1.5 rounded hover:bg-surface-elevated transition-colors"
                            title="Duplicar producto"
                          >
                            <FiCopy size={13} />
                          </button>
                        )}
                        <Link
                          to={`/producto/${productId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-content-secondary hover:text-brand-deep p-1.5 rounded hover:bg-surface-elevated transition-colors"
                          title="Ver ficha en la tienda"
                        >
                          <FiExternalLink size={13} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar ${product.name}?`))
                              onDelete(productId);
                          }}
                          className="text-content-secondary hover:text-status-error p-1.5 rounded hover:bg-status-error-bg transition-colors"
                          title="Eliminar producto"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Fila expandible con control de stock por variante */}
                  {isExpanded && variantCount > 0 && (
                    <tr className="bg-surface-elevated/35">
                      <td colSpan={onToggleSelect ? 7 : 6} className="px-6 py-3.5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase tracking-widest text-brand-deep font-bold">
                            Desglose y ajuste rápido de variantes ({variantCount})
                          </span>
                          <button
                            type="button"
                            onClick={() => onEdit(product)}
                            className="text-[11px] text-brand-deep font-semibold hover:underline"
                          >
                            Abrir editor completo del producto &rarr;
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {product.variants.map((v) => {
                            const vStock = Number(v.stock || 0);
                            return (
                              <div
                                key={v.id || v.sku}
                                className="flex items-center justify-between p-2.5 rounded bg-surface border border-border text-xs"
                              >
                                <div className="min-w-0 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-[10px] text-brand-deep font-semibold">
                                      SKU: {v.sku}
                                    </span>
                                    <span className="text-content-secondary">&bull;</span>
                                    <span className="font-bold text-content">
                                      {themeConfig.brand.currencySymbol}
                                      {Number(v.price || product.price || 0).toLocaleString(
                                        'es-AR'
                                      )}
                                    </span>
                                  </div>
                                  <p className="text-xs text-content truncate mt-0.5">
                                    {formatVariantLabel(v)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => onVariantStockChange?.(product, v.id, -1)}
                                    disabled={vStock <= 0}
                                    className="w-6 h-6 rounded bg-surface-elevated hover:bg-brand text-content hover:text-white flex items-center justify-center border border-border-strong disabled:opacity-30"
                                    title="Restar 1 al stock de esta variante"
                                  >
                                    <FiMinus size={10} />
                                  </button>
                                  <span
                                    className={`w-10 text-center font-mono text-xs py-0.5 rounded border font-semibold ${
                                      vStock > 3
                                        ? 'text-status-success border-status-success-border bg-status-success-bg'
                                        : vStock > 0
                                        ? 'text-status-warning border-status-warning-border bg-status-warning-bg'
                                        : 'text-status-error border-status-error-border bg-status-error-bg'
                                    }`}
                                  >
                                    {vStock}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onVariantStockChange?.(product, v.id, 1)}
                                    className="w-6 h-6 rounded bg-surface-elevated hover:bg-brand text-content hover:text-white flex items-center justify-center border border-border-strong"
                                    title="Sumar 1 al stock de esta variante"
                                  >
                                    <FiPlus size={10} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
