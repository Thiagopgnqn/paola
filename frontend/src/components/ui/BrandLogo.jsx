import React from 'react';

const SIZE_MAP = {
  sm: {
    script: 'text-xl sm:text-2xl',
    bold: 'text-[10px] sm:text-[11px] tracking-[0.18em]',
    sub: 'text-[9px]',
    gap: 'gap-1.5',
  },
  md: {
    script: 'text-2xl sm:text-3xl',
    bold: 'text-xs sm:text-sm tracking-[0.2em]',
    sub: 'text-[10px]',
    gap: 'gap-2',
  },
  lg: {
    script: 'text-3xl sm:text-4xl',
    bold: 'text-sm sm:text-base tracking-[0.22em]',
    sub: 'text-[11px]',
    gap: 'gap-2.5',
  },
};

/**
 * Wordmark temporal reutilizable para Paola Calzados.
 * Cuando la clienta envíe los archivos definitivos del logo,
 * solo es necesario reemplazar este componente o sus SVGs en /public/brand/.
 */
const BrandLogo = ({
  variant = 'horizontal',
  size = 'md',
  showSubtitle = false,
  inverted = false,
  className = '',
}) => {
  const s = SIZE_MAP[size] || SIZE_MAP.md;
  const scriptColor = inverted ? 'text-white' : 'text-brand';
  const boldColor = inverted ? 'text-white/95' : 'text-content';
  const subColor = inverted ? 'text-white/80' : 'text-content-secondary';

  if (variant === 'vertical') {
    return (
      <div
        className={`inline-flex flex-col items-center select-none leading-none ${className}`}
        aria-label="Paola Calzados"
      >
        <span className={`font-script leading-none ${s.script} ${scriptColor}`}>
          Paola
        </span>
        <span
          className={`font-display font-bold uppercase leading-none mt-1 ${s.bold} ${boldColor}`}
        >
          Calzados
        </span>
        {showSubtitle && (
          <span className={`font-sans font-medium tracking-wider uppercase mt-1.5 ${s.sub} ${subColor}`}>
            Mayor y Menor
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex flex-col select-none leading-none ${className}`}
      aria-label="Paola Calzados"
    >
      <div className={`inline-flex items-baseline ${s.gap}`}>
        <span className={`font-script leading-none ${s.script} ${scriptColor}`}>
          Paola
        </span>
        <span className={`font-display font-bold uppercase leading-none ${s.bold} ${boldColor}`}>
          Calzados
        </span>
      </div>
      {showSubtitle && (
        <span className={`font-sans font-medium tracking-wider uppercase mt-1 ${s.sub} ${subColor}`}>
          Por Mayor y Menor · Córdoba
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
