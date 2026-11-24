import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import themeConfig from '../config/theme';
import {
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiFileText,
  FiArrowLeft,
  FiTag,
  FiAlertCircle,
} from 'react-icons/fi';

const LegalPage = () => {
  const { hash } = useLocation();

  useSEO({
    title: `Información Legal, Cambios y Envíos | ${themeConfig.brand.name}`,
    description:
      'Políticas de venta por mayor y menor, envíos, cambios, privacidad y botón de arrepentimiento de Paola Calzados en Córdoba, Argentina.',
  });

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.replace('#', ''));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [hash]);

  return (
    <div className="bg-canvas min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <Link
            to="/"
            className="inline-flex items-center text-xs font-semibold text-content-secondary hover:text-brand-deep mb-6 transition-colors"
          >
            <FiArrowLeft className="mr-1.5" />
            Volver al inicio
          </Link>
          <span className="block text-[11px] uppercase tracking-[0.22em] text-brand-deep font-bold">
            Información Comercial y Legal
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-bold text-content mt-1">
            Políticas, Privacidad y Términos
          </h1>
        </div>

        {/* 1. Sobre Paola Calzados */}
        <section id="nosotros" className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-soft space-y-3">
          <h2 className="font-display font-bold text-base uppercase tracking-wider text-content">
            Sobre Paola Calzados
          </h2>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            Paola Calzados se dedica a la venta de calzado por mayor y por menor en {themeConfig.contact.city}. Ofrecemos modelos para mujer, hombre, niños y niñas con atención directa y seguimiento de pedidos vía WhatsApp e Instagram ({themeConfig.contact.instagram}).
          </p>
          <div className="pt-2 text-xs text-content-secondary space-y-1">
            <p><strong className="text-content">Local / Dirección:</strong> {themeConfig.contact.address}</p>
            <p><strong className="text-content">WhatsApp de atención:</strong> {themeConfig.contact.phoneDisplay}</p>
            <p><strong className="text-content">Correo electrónico:</strong> {themeConfig.contact.email}</p>
            <p><strong className="text-content">Horarios de atención:</strong> {themeConfig.contact.schedule}</p>
            <p><strong className="text-content">Zona de cobertura:</strong> {themeConfig.contact.deliveryZone}</p>
            <p><strong className="text-content">Titular / Razón Social y CUIT:</strong> {themeConfig.contact.legalName}</p>
          </div>
        </section>

        {/* 2. Envíos y Retiros */}
        <section id="envios" className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-soft space-y-3">
          <div className="flex items-center gap-2.5">
            <FiTruck className="text-brand-deep text-lg" />
            <h2 className="font-display font-bold text-base uppercase tracking-wider text-content">
              Envíos y Retiros
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-content font-semibold">
            {themeConfig.policies.shippingNotice}
          </p>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            Realizamos envíos en {themeConfig.contact.deliveryZone} bajo las condiciones vigentes ({themeConfig.policies.shippingCostsAndTimes}). También podés retirar tu compra personalmente en {themeConfig.contact.address} dentro del horario de {themeConfig.contact.schedule}, coordinando previamente por WhatsApp.
          </p>
        </section>

        {/* 3. Cambios y Devoluciones */}
        <section id="cambios" className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-soft space-y-3">
          <div className="flex items-center gap-2.5">
            <FiRefreshCw className="text-brand-deep text-lg" />
            <h2 className="font-display font-bold text-base uppercase tracking-wider text-content">
              Cambios y Devoluciones
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-content font-semibold">
            {themeConfig.policies.returnsPolicyNotice}
          </p>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            Plazo para gestionar cambios: {themeConfig.policies.exchangeWindow}. Condiciones aplicables por talle o falla de fabricación: {themeConfig.policies.exchangeConditions}. Para iniciar una solicitud, escribinos por WhatsApp ({themeConfig.contact.phoneDisplay}) o por correo a {themeConfig.contact.email}.
          </p>
        </section>

        {/* 4. Privacidad y Protección de Datos */}
        <section id="privacidad" className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-soft space-y-3">
          <div className="flex items-center gap-2.5">
            <FiShield className="text-brand-deep text-lg" />
            <h2 className="font-display font-bold text-base uppercase tracking-wider text-content">
              Política de Privacidad
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            Los datos de contacto y entrega proporcionados durante el checkout se utilizan exclusivamente para procesar tu pedido y coordinar el envío o retiro en {themeConfig.brand.name}. No vendemos ni cedemos tus datos personales a terceros, cumpliendo con la Ley 25.326 de Protección de los Datos Personales. Podés solicitar la actualización o baja de tus datos escribiendo a {themeConfig.contact.email}.
          </p>
        </section>

        {/* 5. Términos y Condiciones */}
        <section id="terminos" className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-soft space-y-3">
          <div className="flex items-center gap-2.5">
            <FiFileText className="text-brand-deep text-lg" />
            <h2 className="font-display font-bold text-base uppercase tracking-wider text-content">
              Términos y Condiciones (Mayor y Menor)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            Todos los precios expresados en el sitio están en pesos argentinos (ARS) y corresponden a la modalidad indicada en cada publicación. Para pedidos mayoristas rigen las condiciones y mínimos definidos por el comercio: {themeConfig.policies.wholesaleMinimum}. Los precios y la disponibilidad de talles/colores pueden actualizarse sin previo aviso, respetándose el importe confirmado al momento de emitir el pedido.
          </p>
        </section>

        {/* 6. Términos de Promociones, Campañas y Cupones */}
        <section id="promociones" className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-soft space-y-4">
          <div className="flex items-center gap-2.5">
            <FiTag className="text-brand-deep text-lg" />
            <h2 className="font-display font-bold text-base uppercase tracking-wider text-content">
              Términos de Promociones, Campañas y Cupones
            </h2>
          </div>
          <div className="text-xs sm:text-sm text-content-secondary space-y-3 leading-relaxed">
            <div>
              <h3 className="font-semibold text-content mb-1">
                Transparencia, Honestidad y Veracidad de Precios
              </h3>
              <p>
                En Paola Calzados respetamos la transparencia comercial: el precio de referencia tachado (&ldquo;antes $X&rdquo;) únicamente se muestra si coincide fehacientemente con el precio que dicho producto o variante tuvo vigente en el sistema durante los últimos 30 (treinta) días corridos. Si un artículo en oferta no posee ese antecedente, se exhibe solo el precio final junto a la etiqueta de la promoción.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-content mb-1">
                Vigencia y Stock
              </h3>
              <p>
                Las promociones, descuentos y campañas temporales rigen durante el período informado en el sitio o hasta agotar el stock disponible.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-content mb-1">
                Cupones de Descuento
              </h3>
              <p>
                Los cupones no son acumulables entre sí en un mismo pedido ni canjeables por dinero en efectivo. En cupones con compra mínima, el umbral se calcula sobre el subtotal resultante tras aplicar descuentos automáticos por producto.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Botón de Arrepentimiento / Defensa del Consumidor */}
        <section
          id="arrepentimiento"
          className="bg-surface-elevated p-6 sm:p-8 rounded-xl border-2 border-brand/40 shadow-soft space-y-3"
        >
          <div className="flex items-center gap-2.5">
            <FiAlertCircle className="text-brand-deep text-xl flex-shrink-0" />
            <h2 className="font-display font-bold text-base uppercase tracking-wider text-content">
              Botón de Arrepentimiento / Defensa del Consumidor
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-content font-semibold leading-relaxed">
            {themeConfig.policies.regretButtonNotice}
          </p>
          <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
            Para gestionar una revocación de compra a distancia o consulta ante Defensa de las y los Consumidores, comunicate indicando tu número de pedido a través de {themeConfig.contact.email} o {themeConfig.contact.phoneDisplay}. Verificá siempre los plazos y requisitos vigentes según la normativa argentina aplicable.
          </p>
        </section>
      </div>
    </div>
  );
};

export default LegalPage;
