import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 text-center paola-soft-bg relative overflow-hidden">
      <div className="relative z-10 max-w-md w-full bg-surface border border-border rounded-2xl p-8 sm:p-10 shadow-lifted">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-border bg-surface-elevated flex items-center justify-center text-brand-deep">
          <svg viewBox="0 0 64 64" fill="none" className="w-9 h-9 stroke-current" strokeWidth="1.6">
            <circle cx="32" cy="32" r="20" strokeOpacity="0.6" />
            <path d="M24 38c3-5 13-5 16 0" />
            <circle cx="25" cy="27" r="1.5" fill="currentColor" />
            <circle cx="39" cy="27" r="1.5" fill="currentColor" />
          </svg>
        </div>

        <h1 className="font-display text-6xl sm:text-7xl font-bold text-brand mb-1 tracking-tight">
          404
        </h1>
        <h2 className="font-display text-lg sm:text-xl font-bold text-content mb-3">
          Página no encontrada
        </h2>
        <p className="text-content-secondary text-xs sm:text-sm font-normal mb-7 leading-relaxed">
          El enlace que intentaste abrir no existe, cambió de dirección o fue removido del catálogo.
        </p>
        <Link to="/">
          <Button variant="primary" size="lg" className="px-7 text-xs sm:text-sm">
            Volver a la tienda
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
