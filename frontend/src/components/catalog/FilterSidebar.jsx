import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import client from '../../api/client';
import { FiX, FiTrash2, FiSliders, FiChevronDown, FiChevronRight } from 'react-icons/fi';

const FilterSidebar = ({ filters, setFilters, isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [variantFacets, setVariantFacets] = useState({
    sizes: [],
    colors: [],
    flavors: [],
  });

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [catRes, facetRes] = await Promise.all([
          client.get('/categories'),
          client.get('/products/filters'),
        ]);
        if (Array.isArray(catRes.data)) {
          setCategories(catRes.data);
        }
        if (facetRes.data) {
          setVariantFacets({
            sizes: facetRes.data.sizes || [],
            colors: facetRes.data.colors || [],
            flavors: facetRes.data.flavors || [],
          });
        }
      } catch (err) {
        console.error('Error al cargar filtros:', err);
      }
    };
    fetchFilterData();
  }, []);

  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice || '');

  useEffect(() => {
    setLocalMinPrice(filters.minPrice || '');
    setLocalMaxPrice(filters.maxPrice || '');
  }, [filters.minPrice, filters.maxPrice]);

  const handleCategorySelect = (slug) => {
    setFilters((prev) => {
      const isSame = prev.category === slug && !prev.subcategory;
      return {
        ...prev,
        category: isSame ? undefined : slug,
        subcategory: undefined,
        page: 1,
      };
    });
  };

  const handleSubcategorySelect = (parentSlug, subSlug) => {
    setFilters((prev) => {
      const isSame = prev.subcategory === subSlug;
      return {
        ...prev,
        category: parentSlug,
        subcategory: isSame ? undefined : subSlug,
        page: 1,
      };
    });
  };

  const toggleFacet = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: prev[field] === value ? undefined : value,
      page: 1,
    }));
  };

  const applyPrices = () => {
    setFilters((prev) => ({
      ...prev,
      minPrice: localMinPrice || undefined,
      maxPrice: localMaxPrice || undefined,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setFilters({});
    if (onClose) onClose();
  };

  const content = (
    <div className="space-y-6">
      {/* 0. Filtro Rápido Solo Ofertas */}
      <div className="p-3.5 rounded-lg bg-surface-elevated border border-border shadow-soft">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="text-xs font-semibold text-content">Solo ofertas</span>
          </div>
          <input
            type="checkbox"
            checked={filters.onlyOffers === 'true'}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                onlyOffers: e.target.checked ? 'true' : undefined,
                page: 1,
              }))
            }
            className="w-4 h-4 rounded border-border-strong text-brand focus:ring-brand focus:ring-offset-0 bg-surface cursor-pointer"
          />
        </label>
        <p className="text-[11px] text-content-secondary mt-1 leading-snug">
          Ver calzados con promociones y descuentos comprobados.
        </p>
      </div>

      {/* 1. Categorías y Subcategorías */}
      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
          <h4 className="font-display font-bold text-xs text-content uppercase tracking-wider">
            Categorías
          </h4>
        </div>
        <div className="space-y-1">
          {categories.map((cat) => {
            const isSelected = filters.category === cat.slug || filters.category === cat.name;
            const hasChildren = Array.isArray(cat.children) && cat.children.length > 0;
            return (
              <div key={cat.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs transition-colors text-left ${
                    isSelected && !filters.subcategory
                      ? 'bg-brand text-white font-semibold shadow-sm'
                      : isSelected
                      ? 'bg-surface-elevated text-brand-deep font-semibold'
                      : 'text-content-secondary hover:text-brand-deep hover:bg-surface-elevated/60'
                  }`}
                >
                  <span>{cat.name}</span>
                  {hasChildren && (
                    isSelected ? <FiChevronDown size={13} /> : <FiChevronRight size={13} />
                  )}
                </button>

                {hasChildren && isSelected && (
                  <div className="pl-3 ml-2 border-l border-border-strong space-y-1 py-1">
                    {cat.children.map((sub) => {
                      const isSubSelected =
                        filters.subcategory === sub.slug || filters.subcategory === sub.name;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleSubcategorySelect(cat.slug, sub.slug)}
                          className={`w-full block px-2.5 py-1.5 rounded text-[11px] transition-colors text-left ${
                            isSubSelected
                              ? 'bg-brand text-white font-semibold'
                              : 'text-content-secondary hover:text-brand-deep hover:bg-surface-elevated/60'
                          }`}
                        >
                          {sub.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Rango de Precio */}
      <div>
        <div className="pb-2 mb-3 border-b border-border">
          <h4 className="font-display font-bold text-xs text-content uppercase tracking-wider">
            Rango de Precio
          </h4>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-content-secondary">
              $
            </span>
            <input
              type="number"
              placeholder="Mín"
              aria-label="Precio mínimo"
              className="w-full pl-6 pr-2 py-1.5 text-xs rounded border border-border-strong bg-surface text-content placeholder:text-content-secondary/70 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              onBlur={applyPrices}
              onKeyDown={(e) => e.key === 'Enter' && applyPrices()}
            />
          </div>
          <span className="text-content-secondary text-xs">-</span>
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-content-secondary">
              $
            </span>
            <input
              type="number"
              placeholder="Máx"
              aria-label="Precio máximo"
              className="w-full pl-6 pr-2 py-1.5 text-xs rounded border border-border-strong bg-surface text-content placeholder:text-content-secondary/70 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              onBlur={applyPrices}
              onKeyDown={(e) => e.key === 'Enter' && applyPrices()}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={applyPrices}
          className="mt-2.5 w-full py-1.5 px-3 bg-surface-elevated hover:bg-brand text-content hover:text-white text-xs font-semibold rounded border border-border-strong hover:border-brand transition-colors"
        >
          Aplicar rango
        </button>
      </div>

      {/* 3. Talle */}
      {variantFacets.sizes.length > 0 && (
        <div>
          <div className="pb-2 mb-3 border-b border-border">
            <h4 className="font-display font-bold text-xs text-content uppercase tracking-wider">
              Talle
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {variantFacets.sizes.map((size) => {
              const isSelected = filters.size === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleFacet('size', size)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors border ${
                    isSelected
                      ? 'bg-brand text-white border-brand-deep font-semibold'
                      : 'bg-surface text-content-secondary border-border-strong hover:border-brand hover:text-brand-deep'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Color */}
      {variantFacets.colors.length > 0 && (
        <div>
          <div className="pb-2 mb-3 border-b border-border">
            <h4 className="font-display font-bold text-xs text-content uppercase tracking-wider">
              Color
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
            {variantFacets.colors.map((color) => {
              const isSelected = filters.color === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleFacet('color', color)}
                  className={`px-2.5 py-1 rounded text-[11px] transition-colors border ${
                    isSelected
                      ? 'bg-brand text-white border-brand-deep font-semibold'
                      : 'bg-surface text-content-secondary border-border-strong hover:border-brand hover:text-brand-deep'
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Botón limpiar */}
      <div className="pt-2">
        <button
          type="button"
          onClick={clearFilters}
          className="w-full flex items-center justify-center py-2 px-3 border border-border-strong text-content-secondary rounded text-xs font-medium hover:bg-surface-elevated hover:text-brand-deep transition-colors"
        >
          <FiTrash2 className="mr-1.5 text-xs" />
          Restablecer filtros
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Drawer Móvil */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#141014]/45 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-surface h-full shadow-overlay flex flex-col justify-between border-l border-border">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center space-x-2">
                <FiSliders className="text-brand-deep text-base" />
                <h3 className="font-display font-bold text-sm uppercase tracking-wider text-content">
                  Filtros
                </h3>
              </div>
              <button
                className="text-content-secondary hover:text-brand-deep p-1 rounded-md"
                onClick={onClose}
                aria-label="Cerrar filtros"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">{content}</div>

            <div className="p-4 border-t border-border bg-surface">
              <Button variant="primary" fullWidth size="md" onClick={onClose}>
                Ver Resultados
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Desktop */}
      <div className="hidden lg:block lg:w-64 flex-shrink-0">
        <div className="sticky top-24 bg-surface p-5 rounded-xl border border-border shadow-soft">
          {content}
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
