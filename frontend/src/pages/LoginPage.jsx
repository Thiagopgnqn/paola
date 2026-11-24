import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import themeConfig from '../config/theme';
import useSEO from '../hooks/useSEO';

const LoginPage = () => {
  useSEO({
    title: `Iniciar Sesión | ${themeConfig.brand.name}`,
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center paola-soft-bg py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="relative z-10 max-w-md w-full bg-surface rounded-2xl p-8 sm:p-10 border border-border shadow-lifted">
        <div className="text-center mb-7">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full border border-border bg-surface-elevated flex items-center justify-center text-brand-deep">
            <svg viewBox="0 0 48 48" fill="none" className="w-6 h-6 stroke-current" strokeWidth="1.5">
              <rect x="13" y="21" width="22" height="17" rx="2.5" />
              <path d="M18 21v-5a6 6 0 0112 0v5" />
              <circle cx="24" cy="29" r="2" />
            </svg>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-brand-deep font-bold">
            Acceso a tu Cuenta
          </span>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-content mt-1">
            Iniciar Sesión
          </h1>
          <p className="mt-1 text-xs text-content-secondary">
            Ingresá a tu cuenta en {themeConfig.brand.name}
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
