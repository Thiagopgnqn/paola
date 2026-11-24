import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiInstagram,
  FiMail,
  FiTruck,
  FiMapPin,
  FiClock,
  FiRefreshCw,
  FiShield,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import themeConfig, { buildWhatsAppUrl } from '../../config/theme';
import BrandLogo from '../ui/BrandLogo';
import { isDemoMode, resetDemoState } from '../../api/demo/demoAdapter';

const Footer = () => {
  const whatsappUrl = buildWhatsAppUrl(themeConfig.contact.whatsappDefaultMessage);
  const hasRealEmail =
    themeConfig.contact.email && !themeConfig.contact.email.includes('[');

  return (
    <footer className="bg-surface border-t border-border text-content-secondary transition-colors">
      {/* Banner informativo superior */}
      <div className="bg-surface-elevated border-b border-border py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
          <FiTruck className="text-brand-deep text-base flex-shrink-0" />
          <p className="text-xs text-content font-medium tracking-wide">
            {themeConfig.shippingNotice}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Columna 1: Marca y Propósito */}
          <div className="md:col-span-4 flex flex-col items-start space-y-4">
            <Link to="/" className="inline-block">
              <BrandLogo variant="vertical" size="md" showSubtitle />
            </Link>
            <p className="text-xs text-content-secondary leading-relaxed font-normal max-w-sm">
              {themeConfig.brand.description}
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <a
                href={themeConfig.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-md border border-border bg-surface-elevated flex items-center justify-center text-brand-deep hover:text-white hover:bg-brand hover:border-brand transition-colors"
                aria-label="Instagram @paola_calzadoss"
                title={themeConfig.contact.instagram}
              >
                <FiInstagram size={15} />
              </a>
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-md border border-border bg-surface-elevated flex items-center justify-center text-brand-deep hover:text-white hover:bg-brand hover:border-brand transition-colors"
                  aria-label="WhatsApp Paola Calzados"
                  title={themeConfig.contact.phone}
                >
                  <FaWhatsapp size={15} />
                </a>
              ) : (
                <span
                  className="w-9 h-9 rounded-md border border-border bg-surface-elevated flex items-center justify-center text-content-secondary"
                  title={themeConfig.contact.phone}
                >
                  <FaWhatsapp size={15} />
                </span>
              )}
              {hasRealEmail ? (
                <a
                  href={`mailto:${themeConfig.contact.email}`}
                  className="w-9 h-9 rounded-md border border-border bg-surface-elevated flex items-center justify-center text-brand-deep hover:text-white hover:bg-brand hover:border-brand transition-colors"
                  aria-label="Email de contacto"
                  title={themeConfig.contact.email}
                >
                  <FiMail size={15} />
                </a>
              ) : (
                <span
                  className="w-9 h-9 rounded-md border border-border bg-surface-elevated flex items-center justify-center text-content-secondary"
                  title={`Email: ${themeConfig.contact.email}`}
                >
                  <FiMail size={15} />
                </span>
              )}
            </div>
          </div>

          {/* Columna 2: Categorías */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-display font-bold text-content uppercase tracking-[0.14em] mb-4">
              Categorías
            </h3>
            <ul className="space-y-2.5 text-xs text-content-secondary">
              <li>
                <Link to="/catalogo" className="hover:text-brand-deep transition-colors">
                  Catálogo Completo
                </Link>
              </li>
              <li>
                <Link
                  to="/catalogo?category=mujer"
                  className="hover:text-brand-deep transition-colors"
                >
                  Mujer
                </Link>
              </li>
              <li>
                <Link
                  to="/catalogo?category=hombre"
                  className="hover:text-brand-deep transition-colors"
                >
                  Hombre
                </Link>
              </li>
              <li>
                <Link
                  to="/catalogo?category=ninos"
                  className="hover:text-brand-deep transition-colors"
                >
                  Niños &amp; Niñas
                </Link>
              </li>
              <li>
                <Link
                  to="/catalogo?category=sandalias"
                  className="hover:text-brand-deep transition-colors"
                >
                  Sandalias
                </Link>
              </li>
              <li>
                <Link
                  to="/catalogo?category=zapatillas"
                  className="hover:text-brand-deep transition-colors"
                >
                  Zapatillas
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Información y Políticas */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-display font-bold text-content uppercase tracking-[0.14em] mb-4">
              Información
            </h3>
            <ul className="space-y-2.5 text-xs text-content-secondary">
              <li>
                <Link to="/#nosotros" className="hover:text-brand-deep transition-colors">
                  Sobre Paola Calzados
                </Link>
              </li>
              <li>
                <Link to="/#faq" className="hover:text-brand-deep transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link to="/legal#envios" className="hover:text-brand-deep transition-colors">
                  Envíos y Retiros
                </Link>
              </li>
              <li>
                <Link to="/legal#cambios" className="hover:text-brand-deep transition-colors">
                  Cambios y Devoluciones
                </Link>
              </li>
              <li>
                <Link to="/legal#privacidad" className="hover:text-brand-deep transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/legal#terminos" className="hover:text-brand-deep transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-border-subtle">
              <Link
                to="/legal#arrepentimiento"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-brand/40 bg-surface-elevated text-brand-deep hover:bg-brand hover:text-white transition-colors text-[11px] font-semibold"
              >
                <FiShield size={12} className="flex-shrink-0" />
                <span>Botón de arrepentimiento / Defensa del consumidor</span>
              </Link>
            </div>
          </div>

          {/* Columna 4: Contacto & Córdoba */}
          <div className="md:col-span-3 space-y-2.5 text-xs text-content-secondary">
            <h3 className="text-xs font-display font-bold text-content uppercase tracking-[0.14em] mb-4">
              Contacto &amp; Local
            </h3>
            <p className="flex items-start gap-2">
              <FaWhatsapp className="text-brand-deep mt-0.5 flex-shrink-0" size={14} />
              <span>
                WhatsApp:{' '}
                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-content font-medium hover:text-brand-deep hover:underline"
                  >
                    {themeConfig.contact.phone}
                  </a>
                ) : (
                  <span className="text-content font-medium">{themeConfig.contact.phone}</span>
                )}
              </span>
            </p>
            <p className="flex items-start gap-2">
              <FiMapPin className="text-brand-deep mt-0.5 flex-shrink-0" size={14} />
              <span>
                {themeConfig.contact.city} &bull; Local: {themeConfig.contact.address}
              </span>
            </p>
            <p className="flex items-start gap-2">
              <FiClock className="text-brand-deep mt-0.5 flex-shrink-0" size={14} />
              <span>Horarios: {themeConfig.contact.hours}</span>
            </p>
            <p className="flex items-start gap-2">
              <FiMail className="text-brand-deep mt-0.5 flex-shrink-0" size={14} />
              <span>Email: {themeConfig.contact.email}</span>
            </p>
            <p className="pt-2 text-[11px] text-content-secondary leading-relaxed border-t border-border-subtle">
              {themeConfig.returnPolicyNotice}
            </p>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-12 pt-8 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between text-[11px] text-content-secondary gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>{themeConfig.legal.copyright}</p>
            <span className="hidden sm:inline text-border-strong">&bull;</span>
            <p>
              Instagram:{' '}
              <a
                href={themeConfig.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-deep hover:underline font-semibold"
              >
                {themeConfig.contact.instagram}
              </a>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 md:justify-end">
            {isDemoMode() && (
              <button
                type="button"
                onClick={resetDemoState}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border-strong bg-surface-elevated hover:bg-brand hover:border-brand text-content hover:text-white transition-colors text-xs font-semibold"
                title="Borrar datos locales y restablecer el catálogo original de la demo"
              >
                <FiRefreshCw size={12} />
                <span>Restablecer demo</span>
              </button>
            )}
            <p className="text-center md:text-right text-brand-deep font-medium">
              {themeConfig.legal.note}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
