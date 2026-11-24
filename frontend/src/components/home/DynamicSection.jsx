import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiShield,
  FiTruck,
  FiShoppingBag,
  FiMessageCircle,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Button from '../ui/Button';
import BrandLogo from '../ui/BrandLogo';
import ProductGrid from '../catalog/ProductGrid';
import CountdownTimer from '../campaign/CountdownTimer';
import NewsletterForm from '../newsletter/NewsletterForm';
import themeConfig, { buildWhatsAppUrl } from '../../config/theme';
import { getBrandImage } from '../../utils/productImages';

export const CategoryLineIcon = ({ id }) => {
  switch (id) {
    case 'sandalias':
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8 text-brand stroke-current" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 33c10 2.2 22 2.2 34 0a2.8 2.8 0 0 1 .5 5.4c-12 1.8-23 1.8-34.5 0a2.5 2.5 0 0 1 0-5.4Z" />
          <path d="M15 33.5c1.8-6.5 6-10.5 12-11" />
          <path d="M28 34c1-5.2 3.8-8.8 8-9.5" />
          <path d="M10.5 33l3-11h4l-1.2 11" />
        </svg>
      );
    case 'zapatillas':
    case 'ninos':
    case 'ninas':
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8 text-brand stroke-current" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 30.5V19c0-1 .8-1.6 1.8-1.2 2.8 1.1 5.4 1.6 7.8 1.6 2.6 0 4.8-1.5 6-3.9.5-1 1.7-1.1 2.4-.4l11 10.4c2.4.6 4.5 2 5.2 4.3.4 1.1-.4 2.2-1.5 2.3H8.8A1.8 1.8 0 0 1 7 30.5Z" />
          <path d="M7 34h34a1.8 1.8 0 0 1 0 3.5H8.8A1.8 1.8 0 0 1 7 35.7V34Z" />
          <path d="M25 21l3-1.8M28.5 24.2l3-1.8" />
        </svg>
      );
    case 'mujer':
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8 text-brand stroke-current" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 31.5V18l4.5 1.5c3.2 4.5 6.8 6.8 12.5 7.5 4.2.5 9 2.2 13.5 5.2 1.2.8.8 2.8-.7 2.8H11a2 2 0 0 1-2-2v-1.5Z" />
          <path d="M11.5 35v5M25 35l4 5h9v-5" />
        </svg>
      );
    case 'hombre':
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8 text-brand stroke-current" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 29.5V14h11l1.5 11.5c3 3 7.2 4.5 14 5.5a3.2 3.2 0 0 1 2.8 3.2v2.3H8v-7Z" />
          <path d="M8 36.5h29.5V40H8z" />
          <path d="M19 19h-3.5M19.5 23h-3.5" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8 text-brand stroke-current" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="24" r="14" />
          <circle cx="24" cy="24" r="5" />
        </svg>
      );
  }
};

export const HeroBrandVisual = () => (
  <div
    aria-hidden="true"
    className="relative w-full h-full min-h-[340px] rounded-2xl overflow-hidden bg-gradient-to-br from-surface-elevated via-surface to-surface-elevated border border-border flex flex-col items-center justify-center p-8 shadow-lifted"
  >
    <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-brand/15 blur-2xl pointer-events-none" />
    <div className="absolute -bottom-14 -left-10 w-64 h-64 rounded-full bg-mauve/45 blur-2xl pointer-events-none" />

    <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
      <span className="inline-block px-3.5 py-1 rounded-full bg-brand text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-5 shadow-soft">
        Nueva Colección
      </span>

      <div className="w-24 h-24 rounded-full bg-surface border-2 border-border flex items-center justify-center text-brand shadow-soft mb-5">
        <CategoryLineIcon id="zapatillas" />
      </div>

      <BrandLogo variant="vertical" size="lg" showSubtitle />

      <p className="mt-4 font-script text-xl text-brand-deep">
        Para toda la familia
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2 text-[11px] font-medium text-content-secondary">
        <span className="px-2.5 py-1 rounded-full bg-surface border border-border">Mujer</span>
        <span className="px-2.5 py-1 rounded-full bg-surface border border-border">Hombre</span>
        <span className="px-2.5 py-1 rounded-full bg-surface border border-border">Niños</span>
        <span className="px-2.5 py-1 rounded-full bg-surface border border-border">Sandalias</span>
        <span className="px-2.5 py-1 rounded-full bg-surface border border-border">Zapatillas</span>
      </div>
    </div>
  </div>
);

const DynamicSection = ({
  section,
  products = [],
  loadingProducts = false,
  activeCampaign = null,
  themeConfig: theme = null,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [aboutImgError, setAboutImgError] = useState(false);

  if (!section || section.enabled === false) return null;

  const config = section.config || {};
  const aboutImageUrl = getBrandImage('about');
  const whatsappUrl = buildWhatsAppUrl(themeConfig.contact.whatsappDefaultMessage);

  // =========================================================================
  // 1. HERO (Base o de Campaña)
  // =========================================================================
  if (section.type === 'HERO') {
    const isCampaignHero = Boolean(
      section.campaignId ||
        config.headline?.includes('BLACK FRIDAY') ||
        config.headline?.includes('CYBER')
    );

    if (isCampaignHero) {
      return (
        <section
          className={`relative min-h-[420px] lg:min-h-[480px] flex items-center border-b ${
            theme?.borderAccent || 'border-border'
          } bg-gradient-to-b ${theme?.bgGradient || 'from-canvas via-surface-elevated to-canvas'} overflow-hidden py-12 lg:py-16`}
        >
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-45">
            <svg viewBox="0 0 1200 600" fill="none" className="w-full h-full object-cover">
              <path
                d="M-50,450 C300,200 600,550 1250,250 L1250,650 L-50,650 Z"
                fill={theme?.accent || '#E6007E'}
                fillOpacity="0.1"
              />
              <path
                d="M100,500 Q600,150 1100,450"
                stroke={theme?.accent || '#E6007E'}
                strokeOpacity="0.22"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <span
                className={`inline-block text-[11px] uppercase tracking-[0.22em] px-3.5 py-1 rounded-full mb-4 ${
                  theme?.badgeBg || 'bg-brand'
                } ${theme?.badgeText || 'text-white font-semibold'}`}
              >
                {theme?.tagText || 'CAMPAÑA ESPECIAL'}
              </span>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-content mb-4 leading-[1.12]">
                {config.headline || activeCampaign?.headline || 'Edición Especial Paola Calzados'}
              </h1>

              <p className="text-sm sm:text-base text-content-secondary mb-7 leading-relaxed max-w-xl">
                {config.subheadline ||
                  activeCampaign?.subheadline ||
                  'Aprovechá descuentos reales por tiempo limitado en calzado por mayor y por menor.'}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link to={config.ctaLink || '/ofertas'}>
                  <Button size="lg" variant="primary" className="w-full sm:w-auto px-8 py-3.5">
                    <span>{config.ctaText || 'Aprovechar Ofertas'}</span>
                    <FiArrowRight className="ml-2" />
                  </Button>
                </Link>
                {activeCampaign?.slug && (
                  <Link to={`/campanas/${activeCampaign.slug}`}>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 py-3.5 bg-surface/80">
                      <span>Ver Detalles de Campaña</span>
                    </Button>
                  </Link>
                )}
              </div>

              <div className="mt-8 pt-5 border-t border-border flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-content-secondary font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <FiShoppingBag className="text-brand-deep" /> Por mayor y por menor
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiShield className="text-brand-deep" /> Descuentos reales garantizados
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiTruck className="text-brand-deep" /> Envíos en {themeConfig.contact.deliveryZone}
                </span>
              </div>
            </div>
          </div>
        </section>
      );
    }

    // Hero Base de Paola Calzados
    return (
      <section className="relative py-10 sm:py-14 lg:py-16 paola-soft-bg border-b border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated border border-border text-[11px] uppercase tracking-[0.18em] text-brand-deep font-bold mb-4">
                Córdoba, Argentina &bull; Venta por Mayor y Menor
              </span>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-content mb-4 leading-[1.12]">
                {config.headline || (
                  <>
                    Calzado con estilo{' '}
                    <span className="font-script font-normal text-brand block sm:inline">
                      por mayor y por menor
                    </span>
                  </>
                )}
              </h1>

              <p className="text-sm sm:text-base text-content-secondary mb-7 font-normal leading-relaxed max-w-xl">
                {config.subheadline ||
                  'Zapatillas, sandalias, borcegos y modelos para mujer, hombre, niños y niñas. Armá tu pedido online desde Córdoba y coordiná entrega o retiro directo por WhatsApp.'}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link to={config.ctaLink || '/catalogo'}>
                  <Button size="lg" variant="primary" className="w-full sm:w-auto px-7 py-3">
                    <span>{config.ctaText || 'Ver Catálogo'}</span>
                    <FiArrowRight className="ml-2.5" />
                  </Button>
                </Link>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto px-6 py-3">
                      <FaWhatsapp className="mr-2 text-brand text-base" />
                      <span>Consultar por WhatsApp</span>
                    </Button>
                  </a>
                )}
              </div>

              <div className="mt-7 pt-4 border-t border-border flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-content-secondary font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <FiShoppingBag className="text-brand-deep" /> Compra minorista y mayorista
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiTruck className="text-brand-deep" /> Envíos en {themeConfig.contact.deliveryZone}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiMessageCircle className="text-brand-deep" /> Atención en {themeConfig.contact.hours}
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <HeroBrandVisual />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 2. CAMPAIGN_BANNER
  // =========================================================================
  if (section.type === 'CAMPAIGN_BANNER') {
    return (
      <section className="py-8 sm:py-12 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`relative overflow-hidden rounded-2xl border ${
              theme?.borderAccent || 'border-border'
            } bg-gradient-to-r ${theme?.bgGradient || 'from-surface via-surface-elevated to-surface'} p-8 sm:p-12 shadow-lifted`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 800 300"
              fill="none"
              className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
            >
              <circle cx="700" cy="80" r="140" stroke={theme?.accent || '#E6007E'} strokeWidth="1.5" />
              <path d="M-50,220 C200,80 500,280 850,150" stroke={theme?.accent || '#B80063'} strokeWidth="1.5" />
            </svg>

            <div className="relative z-10 max-w-2xl">
              {config.badge && (
                <span
                  className={`inline-block text-[10px] sm:text-[11px] uppercase tracking-[0.22em] px-3.5 py-1 rounded-full mb-3.5 ${
                    theme?.badgeBg || 'bg-brand'
                  } ${theme?.badgeText || 'text-white font-semibold'}`}
                >
                  {config.badge}
                </span>
              )}

              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight text-content mb-3 leading-tight">
                {config.title || activeCampaign?.headline || 'Promoción Destacada'}
              </h2>

              <p className="text-xs sm:text-sm text-content-secondary mb-6 leading-relaxed">
                {config.subtitle || activeCampaign?.subheadline || 'Aprovechá beneficios exclusivos en calzado de temporada.'}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link to={config.ctaLink || (activeCampaign?.slug ? `/campanas/${activeCampaign.slug}` : '/ofertas')}>
                  <Button size="md" variant="primary" className="px-6 py-2.5">
                    <span>{config.ctaText || 'Ver Colección'}</span>
                    <FiArrowRight className="ml-2" />
                  </Button>
                </Link>
                {activeCampaign?.conditionsText && (
                  <span className="text-[11px] text-content-secondary">
                    Condiciones aplicables &bull; Hasta agotar stock
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 3. COUNTDOWN
  // =========================================================================
  if (section.type === 'COUNTDOWN') {
    const targetDate = config.targetDate || activeCampaign?.endsAt || null;
    if (!targetDate) return null;

    return (
      <div className="py-6 sm:py-8 bg-canvas">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <CountdownTimer
            targetDate={targetDate}
            title={config.title || 'Tiempo restante de campaña:'}
            message={config.message || 'Los precios promocionales finalizan automáticamente al cumplirse el plazo.'}
            themeConfig={theme}
          />
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. PRODUCT_GRID
  // =========================================================================
  if (section.type === 'PRODUCT_GRID') {
    const limit = Number(config.limit || 6);
    let displayProducts = products;

    if (config.filter === 'campaign' && activeCampaign?.id) {
      displayProducts = products.filter((p) =>
        (p.activePromotions || []).some((ap) => ap.campaignId === activeCampaign.id)
      );
      if (displayProducts.length === 0) displayProducts = products;
    }

    return (
      <section className="py-14 sm:py-20 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-border">
            <div>
              <span className="text-[11px] uppercase tracking-[0.22em] text-brand-deep font-bold">
                {config.subtitle || 'Selección'}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-content mt-1.5">
                {config.title || 'Destacados de Temporada'}
              </h2>
            </div>
            <Link
              to="/catalogo"
              className="mt-3 sm:mt-0 text-xs font-semibold uppercase tracking-wider text-brand-deep hover:text-brand inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Ver todos</span>
              <FiArrowRight size={13} />
            </Link>
          </div>

          <ProductGrid products={displayProducts.slice(0, limit)} loading={loadingProducts} />

          <div className="mt-10 text-center">
            <Link to="/catalogo">
              <Button variant="outline" size="lg" className="px-8">
                Ver el catálogo completo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 5. CATEGORY_GRID
  // =========================================================================
  if (section.type === 'CATEGORY_GRID') {
    return (
      <section className="py-16 sm:py-20 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-border">
            <div>
              <span className="text-[11px] uppercase tracking-[0.22em] text-brand-deep font-bold">
                {config.subtitle || 'Paola Calzados'}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-content mt-1.5">
                {config.title || 'Categorías de Calzado'}
              </h2>
            </div>
            <Link
              to="/catalogo"
              className="mt-3 sm:mt-0 text-xs font-semibold uppercase tracking-wider text-brand-deep hover:text-brand inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Ver catálogo completo</span>
              <FiArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {themeConfig.featuredCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalogo?category=${cat.slug}`}
                className="group flex flex-col border border-border rounded-xl overflow-hidden bg-surface hover:border-brand hover:shadow-lifted transition-smooth"
              >
                <div className="h-36 w-full overflow-hidden paola-card-texture relative flex flex-col items-center justify-center p-5 border-b border-border">
                  <div className="relative z-10 w-14 h-14 rounded-full border border-border bg-surface flex items-center justify-center group-hover:scale-105 group-hover:border-brand transition-all duration-300 shadow-sm">
                    <CategoryLineIcon id={cat.id} />
                  </div>
                  <span className="relative z-10 mt-2.5 text-[11px] font-medium text-content-secondary text-center line-clamp-1">
                    {cat.subtitle}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display text-base font-bold text-content mb-1.5 group-hover:text-brand-deep transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-content-secondary leading-relaxed font-normal mb-4 flex-1">
                    {cat.description}
                  </p>
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-deep inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                    <span>Explorar</span>
                    <FiArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 6. TEXT_BLOCK ("Sobre Nosotros")
  // =========================================================================
  if (section.type === 'TEXT_BLOCK') {
    return (
      <section id={config.id || 'nosotros'} className="py-16 sm:py-20 paola-soft-bg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <span className="text-[11px] uppercase tracking-[0.22em] text-brand-deep font-bold mb-3 block">
                Sobre Paola Calzados
              </span>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-content mb-5 leading-snug">
                {config.title || 'Calzado por mayor y por menor con atención personalizada en Córdoba.'}
              </h2>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed mb-4">
                En Paola Calzados trabajamos modelos para mujer, hombre, niños y niñas, abarcando zapatillas urbanas y deportivas, sandalias, plataformas, borcegos y calzado diario. Podés comprar desde un par o armar tu pedido mayorista ({themeConfig.policies.wholesaleMinimum}).
              </p>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed mb-7">
                Coordinamos cada pedido por WhatsApp para confirmar disponibilidad de talles y colores, entregas en {themeConfig.contact.deliveryZone} o retiro en {themeConfig.contact.address}.
              </p>
              <Link to="/legal">
                <Button variant="secondary" size="md">
                  Conocé nuestras políticas de envíos y cambios
                </Button>
              </Link>
            </div>

            <div className="lg:col-span-5">
              {aboutImageUrl && !aboutImgError ? (
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border bg-surface shadow-lifted">
                  <img
                    src={aboutImageUrl}
                    width="1000"
                    height="750"
                    loading="lazy"
                    decoding="async"
                    alt="Sobre Paola Calzados — Córdoba"
                    onError={() => setAboutImgError(true)}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border paola-card-texture p-8 flex flex-col items-center justify-center text-center shadow-lifted">
                  <BrandLogo variant="vertical" size="lg" showSubtitle />
                  <p className="mt-5 text-xs text-content-secondary max-w-xs leading-relaxed">
                    Córdoba, Argentina &bull; Seguinos en Instagram{' '}
                    <a
                      href={themeConfig.contact.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-deep font-semibold hover:underline"
                    >
                      {themeConfig.contact.instagram}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 7. BENEFITS
  // =========================================================================
  if (section.type === 'BENEFITS') {
    return (
      <section className="py-14 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-lg bg-surface-elevated text-brand-deep border border-border mt-0.5">
                <FiShoppingBag size={18} />
              </div>
              <div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-content">
                  Por Mayor y Menor
                </h3>
                <p className="text-xs text-content-secondary mt-1.5 leading-relaxed">
                  Llevá desde 1 par o armá tu pedido mayorista ({themeConfig.policies.wholesaleMinimum}).
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-lg bg-surface-elevated text-brand-deep border border-border mt-0.5">
                <FiTruck size={18} />
              </div>
              <div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-content">
                  Envíos y Retiro
                </h3>
                <p className="text-xs text-content-secondary mt-1.5 leading-relaxed">
                  Entregas en {themeConfig.contact.deliveryZone} o retiro en {themeConfig.contact.address}.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-lg bg-surface-elevated text-brand-deep border border-border mt-0.5">
                <FiMessageCircle size={18} />
              </div>
              <div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-content">
                  Atención por WhatsApp
                </h3>
                <p className="text-xs text-content-secondary mt-1.5 leading-relaxed">
                  Consultá disponibilidad de talles, colores y precios mayoristas de forma directa.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-lg bg-surface-elevated text-brand-deep border border-border mt-0.5">
                <FiShield size={18} />
              </div>
              <div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-content">
                  Compra Clara
                </h3>
                <p className="text-xs text-content-secondary mt-1.5 leading-relaxed">
                  Precios transparentes y descuentos reales verificables sobre historial de 30 días.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 8. FAQ
  // =========================================================================
  if (section.type === 'FAQ') {
    return (
      <section id={config.id || 'faq'} className="py-16 sm:py-20 bg-canvas">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-[11px] uppercase tracking-[0.22em] text-brand-deep font-bold">
              Dudas Frecuentes
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-content mt-1.5">
              {config.title || 'Preguntas Frecuentes'}
            </h2>
            <p className="text-xs sm:text-sm text-content-secondary mt-2">
              Todo lo que necesitás saber sobre compras por mayor y menor, envíos, pagos y cambios.
            </p>
          </div>

          <div className="divide-y divide-border border border-border rounded-xl bg-surface overflow-hidden shadow-soft">
            {themeConfig.faq.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-content hover:bg-surface-elevated/50 transition-colors"
                  >
                    <span>{item.question}</span>
                    {isOpen ? (
                      <FiChevronUp className="text-brand-deep flex-shrink-0 ml-4" />
                    ) : (
                      <FiChevronDown className="text-content-secondary flex-shrink-0 ml-4" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs sm:text-sm text-content-secondary leading-relaxed">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 9. NEWSLETTER
  // =========================================================================
  if (section.type === 'NEWSLETTER') {
    return (
      <section className="py-12 sm:py-16 bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <NewsletterForm
            title={config.title || 'Suscribite a nuestro Newsletter'}
            subtitle={config.subtitle || 'Recibí ingresos de temporada, promos mayoristas y cupones de descuento en tu correo.'}
          />
        </div>
      </section>
    );
  }

  return null;
};

export default DynamicSection;
