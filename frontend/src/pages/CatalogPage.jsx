import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import useProducts from '../hooks/useProducts';
import ProductGrid from '../components/catalog/ProductGrid';
import FilterSidebar from '../components/catalog/FilterSidebar';
import SearchBar from '../components/catalog/SearchBar';
import useSEO from '../hooks/useSEO';
import { FiSliders, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import themeConfig from '../config/theme';

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, fetchProducts, pagination } = useProducts();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const isFirstRender = useRef(true);

  const [filters, setFilters] = useState(() => {
    const init = {};
    if (searchParams.get('category')) init.category = searchParams.get('category');
    if (searchParams.get('subcategory')) init.subcategory = searchParams.get('subcategory');
    if (searchParams.get('size')) init.size = searchParams.get('size');
    if (searchParams.get('color')) init.color = searchParams.get('color');
    if (searchParams.get('flavor')) init.flavor = searchParams.get('flavor');
    if (searchParams.get('search')) init.search = searchParams.get('search');
    if (searchParams.get('minPrice')) init.minPrice = searchParams.get('minPrice');
    if (searchParams.get('maxPrice')) init.maxPrice = searchParams.get('maxPrice');
    if (searchParams.get('sort')) init.sort = searchParams.get('sort');
    if (searchParams.get('onlyOffers') === 'true') init.onlyOffers = 'true';
    if (searchParams.get('page')) init.page = Number(searchParams.get('page'));
    return init;
  });

  // Sincronizar filtros cuando cambian desde la navegación del Header / Footer
  useEffect(() => {
    const urlCategory = searchParams.get('category') || undefined;
    const urlSubcategory = searchParams.get('subcategory') || undefined;
    const urlOnlyOffers = searchParams.get('onlyOffers') === 'true' ? 'true' : undefined;
    if (
      urlCategory !== filters.category ||
      urlSubcategory !== filters.subcategory ||
      urlOnlyOffers !== filters.onlyOffers
    ) {
      setFilters((prev) => ({
        ...prev,
        category: urlCategory,
        subcategory: urlSubcategory,
        onlyOffers: urlOnlyOffers,
        page: 1,
      }));
    }
  }, [searchParams]);

  const categoryTitle = filters.subcategory || filters.category;
  const formattedCategory = categoryTitle
    ? categoryTitle.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : null;

  useSEO({
    title: formattedCategory
      ? `${formattedCategory} — Catálogo | ${themeConfig.brand.name}`
      : filters.onlyOffers === 'true'
      ? `Ofertas y Promociones | ${themeConfig.brand.name}`
      : `Catálogo Completo | ${themeConfig.brand.name}`,
    description: `Explorá nuestro catálogo de ${formattedCategory || 'calzado para mujer, hombre, niños y niñas por mayor y por menor'} en Córdoba. Atención directa por WhatsApp.`,
  });

  const activeFiltersCount =
    (filters.onlyOffers ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.subcategory ? 1 : 0) +
    (filters.size ? 1 : 0) +
    (filters.color ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0);

  useEffect(() => {
    const params = { ...filters };
    Object.keys(params).forEach((key) => {
      if (params[key] === '' || params[key] === undefined || params[key] === null) {
        delete params[key];
      }
    });

    if (!isFirstRender.current) {
      setSearchParams(params, { replace: true });
    }
    isFirstRender.current = false;

    fetchProducts(params);
  }, [filters, fetchProducts, setSearchParams]);

  const handleSearch = (query) => {
    setFilters((prev) => ({ ...prev, search: query || undefined, page: 1 }));
  };

  const removeFilterKey = (key) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: undefined, page: 1 };
      if (key === 'category') next.subcategory = undefined;
      return next;
    });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Encabezado y búsqueda */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-brand-deep font-bold">
              Catálogo Mayor y Menor
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-content mt-1">
              {formattedCategory || 'Calzados'}
            </h1>
            <p className="text-xs sm:text-sm text-content-secondary mt-1">
              {pagination.total || products.length}{' '}
              {(pagination.total || products.length) === 1
                ? 'modelo disponible'
                : 'modelos disponibles'}
            </p>
          </div>

          <div className="w-full md:w-80">
            <SearchBar initialQuery={filters.search} onSearch={handleSearch} />
          </div>
        </div>

        {/* Barra de Filtros Mobile y Ordenamiento */}
        <div className="flex items-center justify-between gap-3 mt-4">
          <button
            type="button"
            className="flex-1 lg:hidden flex items-center justify-center space-x-2 py-2.5 px-3 bg-surface border border-border-strong rounded-md text-xs font-semibold text-content hover:border-brand transition-colors"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <FiSliders className="text-brand-deep text-xs" />
            <span>Filtrar</span>
            {activeFiltersCount > 0 && (
              <span className="bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="flex-1 sm:flex-none flex items-center space-x-2 ml-auto">
            <div className="relative w-full sm:w-auto">
              <select
                aria-label="Ordenar productos"
                className="w-full rounded-md border border-border-strong text-xs text-content focus:border-brand focus:ring-1 focus:ring-brand py-2.5 pl-3 pr-8 bg-surface shadow-soft"
                value={filters.sort || ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, sort: e.target.value || undefined, page: 1 }))
                }
              >
                <option value="">Ordenar: Destacados</option>
                <option value="discount_desc">Mayor Descuento</option>
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
                <option value="newest">Novedades</option>
                <option value="best_selling">Más Vendidos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chips de filtros activos */}
        {(activeFiltersCount > 0 || filters.search) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-border-subtle">
            <span className="text-xs text-content-secondary mr-1">Filtros activos:</span>

            {filters.onlyOffers && (
              <span className="inline-flex items-center text-xs bg-brand text-white px-2.5 py-1 rounded font-semibold">
                Solo ofertas
                <button
                  type="button"
                  onClick={() => removeFilterKey('onlyOffers')}
                  className="ml-1.5 text-white/80 hover:text-white"
                >
                  <FiX size={11} />
                </button>
              </span>
            )}

            {filters.category && (
              <span className="inline-flex items-center text-xs bg-surface-elevated text-content px-2.5 py-1 rounded border border-border font-medium">
                Categoría: {filters.category}
                <button
                  type="button"
                  onClick={() => removeFilterKey('category')}
                  className="ml-1.5 text-content-secondary hover:text-brand-deep"
                >
                  <FiX size={11} />
                </button>
              </span>
            )}

            {filters.subcategory && (
              <span className="inline-flex items-center text-xs bg-surface-elevated text-content px-2.5 py-1 rounded border border-border font-medium">
                Subcategoría: {filters.subcategory}
                <button
                  type="button"
                  onClick={() => removeFilterKey('subcategory')}
                  className="ml-1.5 text-content-secondary hover:text-brand-deep"
                >
                  <FiX size={11} />
                </button>
              </span>
            )}

            {filters.size && (
              <span className="inline-flex items-center text-xs bg-surface-elevated text-content px-2.5 py-1 rounded border border-border font-medium">
                Talle: {filters.size}
                <button
                  type="button"
                  onClick={() => removeFilterKey('size')}
                  className="ml-1.5 text-content-secondary hover:text-brand-deep"
                >
                  <FiX size={11} />
                </button>
              </span>
            )}

            {filters.color && (
              <span className="inline-flex items-center text-xs bg-surface-elevated text-content px-2.5 py-1 rounded border border-border font-medium">
                Color: {filters.color}
                <button
                  type="button"
                  onClick={() => removeFilterKey('color')}
                  className="ml-1.5 text-content-secondary hover:text-brand-deep"
                >
                  <FiX size={11} />
                </button>
              </span>
            )}

            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex items-center text-xs bg-surface-elevated text-content px-2.5 py-1 rounded border border-border font-medium">
                ${filters.minPrice || '0'} - ${filters.maxPrice || '∞'}
                <button
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      minPrice: undefined,
                      maxPrice: undefined,
                      page: 1,
                    }))
                  }
                  className="ml-1.5 text-content-secondary hover:text-brand-deep"
                >
                  <FiX size={11} />
                </button>
              </span>
            )}

            {filters.search && (
              <span className="inline-flex items-center text-xs bg-surface-elevated text-content px-2.5 py-1 rounded border border-border font-medium">
                &ldquo;{filters.search}&rdquo;
                <button
                  type="button"
                  onClick={() => removeFilterKey('search')}
                  className="ml-1.5 text-content-secondary hover:text-brand-deep"
                >
                  <FiX size={11} />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={() => setFilters({})}
              className="text-xs text-brand-deep hover:text-brand underline ml-2 font-semibold"
            >
              Limpiar todos
            </button>
          </div>
        )}
      </div>

      {/* Grilla Principal y Filtros */}
      <div className="flex flex-col lg:flex-row gap-8">
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
        />
        <div className="flex-1">
          <ProductGrid products={products} loading={loading} />

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12 pt-6 border-t border-border">
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded border border-border-strong bg-surface text-content disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-elevated transition-colors"
                aria-label="Página anterior"
              >
                <FiChevronLeft size={16} />
              </button>
              <span className="text-xs text-content-secondary px-3">
                Página <strong className="text-content font-semibold">{pagination.page}</strong> de{' '}
                {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded border border-border-strong bg-surface text-content disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-elevated transition-colors"
                aria-label="Página siguiente"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;
