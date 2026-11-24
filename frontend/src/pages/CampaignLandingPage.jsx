import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import client from '../api/client';
import useSEO from '../hooks/useSEO';
import ProductGrid from '../components/catalog/ProductGrid';
import CountdownTimer from '../components/campaign/CountdownTimer';
import Button from '../components/ui/Button';
import { getCampaignTheme } from '../pricing-engine/index.js';
import { FiArrowLeft, FiShield, FiTruck, FiShoppingBag, FiAlertCircle } from 'react-icons/fi';
import themeConfig from '../config/theme';

const CampaignLandingPage = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const previewParam = searchParams.get('preview');

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCampaign = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = previewParam
          ? `/campaigns/public/${encodeURIComponent(slug)}?preview=${encodeURIComponent(previewParam)}`
          : `/campaigns/public/${encodeURIComponent(slug)}`;
        const res = await client.get(url);
        if (isMounted) {
          setCampaign(res.data);
          if (!previewParam && res.data?.id) {
            const viewedKey = `viewed_camp_${res.data.id}`;
            if (!sessionStorage.getItem(viewedKey)) {
              sessionStorage.setItem(viewedKey, '1');
              client.post(`/campaigns/${res.data.id}/view`).catch(() => {});
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || 'No se pudo cargar la campaña');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCampaign();

    return () => {
      isMounted = false;
    };
  }, [slug, previewParam]);

  const isDraftOrPreview = Boolean(previewParam) || (campaign && campaign.effectiveStatus !== 'ACTIVE');

  useSEO({
    title: campaign?.seoTitle || (campaign ? `${campaign.name} | ${themeConfig.brand.name}` : 'Campaña'),
    description: campaign?.seoDescription || campaign?.description || `Promociones en ${themeConfig.brand.name}.`,
    noindex: isDraftOrPreview,
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-canvas">
        <div className="w-8 h-8 rounded-full border-2 border-border border-t-brand animate-spin" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-canvas px-4">
        <div className="max-w-md w-full text-center p-8 rounded-xl border border-border bg-surface shadow-soft">
          <FiAlertCircle className="mx-auto text-brand-deep text-4xl mb-4" />
          <h1 className="font-display font-bold text-xl text-content mb-2">
            Campaña no disponible
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary mb-6 leading-relaxed">
            Esta campaña no está disponible públicamente en este momento o ya finalizó.
          </p>
          <Link to="/catalogo">
            <Button variant="primary" size="md">
              Ver Catálogo General
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const theme = getCampaignTheme(campaign.theme);
  const products = campaign.products || [];

  return (
    <div className="bg-canvas min-h-screen">
      {isDraftOrPreview && (
        <div className="bg-amber-400 text-[#141014] py-2 px-4 text-xs font-semibold text-center sticky top-0 z-30 shadow-md">
          Estás visualizando esta campaña en modo borrador o vista previa ({campaign.effectiveStatus}). No está indexada en buscadores.
        </div>
      )}

      {/* Hero Banner de la Campaña */}
      <section
        className={`relative py-14 sm:py-20 border-b ${theme.borderAccent} bg-gradient-to-b ${theme.bgGradient} overflow-hidden`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 1000 350"
          fill="none"
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        >
          <path d="M-50,280 C250,80 650,380 1050,160" stroke={theme.accent} strokeWidth="2" />
        </svg>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-1.5 text-xs text-content-secondary hover:text-brand-deep mb-6 transition-colors font-semibold uppercase tracking-wider"
          >
            <FiArrowLeft size={13} />
            <span>Volver al Catálogo</span>
          </Link>

          <div className="max-w-3xl">
            <span
              className={`inline-block text-[11px] uppercase tracking-[0.22em] px-3.5 py-1 rounded-full mb-4 ${theme.badgeBg} ${theme.badgeText}`}
            >
              {theme.tagText || 'EDICIÓN ESPECIAL'}
            </span>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-content mb-4 leading-tight">
              {campaign.headline || campaign.name}
            </h1>

            <p className="text-sm sm:text-base text-content-secondary mb-8 leading-relaxed">
              {campaign.subheadline || campaign.description || 'Promociones por tiempo limitado en modelos seleccionados.'}
            </p>

            {campaign.showCountdown && campaign.endsAt && (
              <div className="mb-8">
                <CountdownTimer
                  targetDate={campaign.endsAt}
                  title="Vigencia de la campaña:"
                  compact
                  themeConfig={theme}
                />
              </div>
            )}

            {campaign.conditionsText && (
              <div className="p-4 sm:p-5 rounded-lg border border-border bg-surface/90 text-xs text-content-secondary leading-relaxed">
                <strong className="text-content uppercase tracking-wider text-[10px] block mb-1">
                  Bases y Condiciones de la Campaña:
                </strong>
                {campaign.conditionsText}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Grilla de Productos de la Campaña */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-border">
          <div>
            <span className="text-[11px] uppercase tracking-[0.22em] text-brand-deep font-bold">
              Colección en Promoción
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-content mt-1.5">
              Modelos Incluidos ({products.length})
            </h2>
          </div>
          <span className="text-xs text-content-secondary mt-2 sm:mt-0">
            Precios finales calculados automáticamente
          </span>
        </div>

        {products.length > 0 ? (
          <ProductGrid products={products} loading={false} />
        ) : (
          <div className="text-center py-16 px-4 rounded-xl border border-border bg-surface">
            <p className="text-content-secondary text-sm">
              No hay calzados con promociones directas asociadas a esta campaña actualmente.
            </p>
            <Link to="/catalogo" className="mt-4 inline-block">
              <Button variant="outline" size="sm">
                Ver Catálogo General
              </Button>
            </Link>
          </div>
        )}

        {/* Garantías de confianza */}
        <div className="mt-16 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <FiShoppingBag className="text-brand-deep text-2xl mb-2" />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-content">Mayor y Menor</h3>
            <p className="text-xs text-content-secondary mt-1">Comprá desde 1 par o armá tu pedido mayorista</p>
          </div>
          <div className="flex flex-col items-center">
            <FiShield className="text-brand-deep text-2xl mb-2" />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-content">Precios Honestos</h3>
            <p className="text-xs text-content-secondary mt-1">Descuentos respaldados en historial verificado</p>
          </div>
          <div className="flex flex-col items-center">
            <FiTruck className="text-brand-deep text-2xl mb-2" />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-content">Entregas en Córdoba</h3>
            <p className="text-xs text-content-secondary mt-1">Coordinación directa por WhatsApp</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CampaignLandingPage;
