import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import themeConfig from '../config/theme';
import useSEO from '../hooks/useSEO';

const RegisterPage = () => {
  useSEO({
    title: `Crear Cuenta | ${themeConfig.brand.name}`,
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center paola-soft-bg py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-surface rounded-2xl p-8 sm:p-10 border border-border shadow-lifted">
        <div className="text-center mb-8">
          <span className="text-[10px] uppercase tracking-widest text-brand-deep font-bold">
            Registro de Cliente
          </span>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-content mt-1">
            Crear Cuenta
          </h1>
          <p className="mt-1 text-xs text-content-secondary">
            Guardá tus datos para agilizar tus próximos pedidos en {themeConfig.brand.name}
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
