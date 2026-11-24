import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiInfo,
  FiRefreshCw,
  FiKey,
  FiCheck,
  FiCopy,
  FiExternalLink,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import {
  isDemoMode,
  resetDemoState,
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
} from '../../api/demo/demoAdapter';
import useAuth from '../../hooks/useAuth';

const MINIMIZED_STORAGE_KEY = 'paola_demo_banner_minimized';

const DemoBanner = () => {
  const [minimized, setMinimized] = useState(() => {
    try {
      return localStorage.getItem(MINIMIZED_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [showCredentials, setShowCredentials] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const { isAdmin } = useAuth();

  if (!isDemoMode()) return null;

  const toggleMinimized = (val) => {
    setMinimized(val);
    if (val) setShowCredentials(false);
    try {
      localStorage.setItem(MINIMIZED_STORAGE_KEY, val ? 'true' : 'false');
    } catch {
      // ignore storage errors
    }
  };

  const handleCopy = (text, field) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  if (minimized) {
    return (
      <div
        role="region"
        aria-label="Aviso de modo demostración minimizado"
        className="fixed bottom-2.5 right-2.5 z-30 flex items-center gap-1.5 rounded-full bg-surface/95 backdrop-blur-md border border-border-strong px-3 py-1.5 text-[11px] text-content shadow-lifted"
      >
        <span className="w-2 h-2 rounded-full bg-brand flex-shrink-0" />
        <button
          type="button"
          onClick={() => toggleMinimized(false)}
          className="inline-flex items-center gap-1 text-content hover:text-brand-deep font-semibold transition-colors"
          title="Expandir barra de modo demostración"
        >
          <span>Modo demo</span>
          <FiChevronUp size={12} className="text-brand-deep" />
        </button>
        <span className="text-border-strong">|</span>
        <button
          type="button"
          onClick={resetDemoState}
          className="text-brand-deep hover:text-brand transition-colors p-0.5"
          title="Restablecer demo"
          aria-label="Restablecer demo"
        >
          <FiRefreshCw size={11} />
        </button>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Aviso de modo demostración"
      className="fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur-md border-t border-border-strong text-content shadow-lifted"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-content-secondary min-w-0">
          <FiInfo size={13} className="text-brand-deep flex-shrink-0" />
          <span className="font-medium text-content-secondary truncate">
            Modo demostración Paola Calzados: los datos son de prueba y se guardan solo en tu navegador
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          <button
            type="button"
            onClick={() => setShowCredentials((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-border-strong bg-surface-elevated hover:bg-brand hover:border-brand text-brand-deep hover:text-white transition-colors font-semibold"
          >
            <FiKey size={11} />
            <span>Acceso Admin</span>
          </button>

          <button
            type="button"
            onClick={resetDemoState}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-border-strong bg-surface hover:bg-brand hover:border-brand text-content hover:text-white transition-colors font-semibold"
            title="Borrar cambios locales y restaurar datos originales de la demo"
          >
            <FiRefreshCw size={11} />
            <span>Restablecer demo</span>
          </button>

          <button
            type="button"
            onClick={() => toggleMinimized(true)}
            className="inline-flex items-center gap-0.5 px-2 py-1 rounded text-content-secondary hover:text-brand-deep hover:bg-surface-elevated transition-colors"
            title="Minimizar a pastilla"
            aria-label="Minimizar aviso de demostración"
          >
            <FiChevronDown size={13} />
            <span className="hidden sm:inline text-[10px] font-medium">Minimizar</span>
          </button>
        </div>
      </div>

      {showCredentials && (
        <div className="border-t border-border bg-surface-elevated/80 px-3 sm:px-6 py-2 text-[11px]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-content">
              <span className="text-[10px] uppercase tracking-wider text-brand-deep font-bold">
                Admin Demo:
              </span>
              <span className="inline-flex items-center gap-1.5 bg-surface px-2.5 py-0.5 rounded border border-border-strong text-content font-mono text-[11px]">
                <span>Usuario: {DEMO_ADMIN_EMAIL}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(DEMO_ADMIN_EMAIL, 'email')}
                  className="text-brand-deep hover:text-brand ml-1"
                  title="Copiar usuario"
                >
                  {copiedField === 'email' ? <FiCheck size={11} /> : <FiCopy size={11} />}
                </button>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-surface px-2.5 py-0.5 rounded border border-border-strong text-content font-mono text-[11px]">
                <span>Clave: {DEMO_ADMIN_PASSWORD}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(DEMO_ADMIN_PASSWORD, 'pass')}
                  className="text-brand-deep hover:text-brand ml-1"
                  title="Copiar contraseña"
                >
                  {copiedField === 'pass' ? <FiCheck size={11} /> : <FiCopy size={11} />}
                </button>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin ? (
                <Link
                  to="/admin"
                  onClick={() => setShowCredentials(false)}
                  className="inline-flex items-center gap-1 text-brand-deep hover:text-brand font-semibold underline underline-offset-2"
                >
                  <span>Ir al Panel Admin</span>
                  <FiExternalLink size={11} />
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setShowCredentials(false)}
                  className="inline-flex items-center gap-1 text-brand-deep hover:text-brand font-semibold underline underline-offset-2"
                >
                  <span>Iniciar sesión como Admin</span>
                  <FiExternalLink size={11} />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoBanner;
