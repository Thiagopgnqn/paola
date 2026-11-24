import React from 'react';
import BrandLogo from './BrandLogo';

const FootwearMinimalIcon = ({ type = 'default', className = 'w-10 h-10' }) => {
  const normalized = String(type || '').toLowerCase();

  if (normalized.includes('sandal') || normalized.includes('ojota')) {
    return (
      <svg
        className={className}
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 27.5c8.5 1.8 18.5 1.8 29.5 0a2.5 2.5 0 0 1 .5 4.8c-10.5 1.6-20 1.6-29.5 0A2.2 2.2 0 0 1 5 27.5Z" />
        <path d="M12 28c1.5-5.5 5-9 10-9.5" />
        <path d="M23 28.5c.8-4.5 3.2-7.5 6.8-8.2" />
        <path d="M8 27.5l2.5-9.5h3.5l-1 9.5" />
      </svg>
    );
  }

  if (normalized.includes('bota') || normalized.includes('borcego')) {
    return (
      <svg
        className={className}
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10 8h9l1 11c2.5 2.8 6 4.2 12 5a3 3 0 0 1 2.5 3v3.5H8V8Z" />
        <path d="M8 30.5h26.5v3H8z" />
        <path d="M19 14h-3M19 18h-3" />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 25.5V16c0-.8.7-1.4 1.5-1.1 2.4.9 4.5 1.4 6.5 1.4 2.2 0 4-1.3 5-3.3.4-.8 1.4-.9 2-.3l9.2 8.7c2 .5 3.8 1.7 4.4 3.6.3.9-.3 1.9-1.3 2H7.5A1.5 1.5 0 0 1 6 25.5Z" />
      <path d="M6 28.5h28.5a1.5 1.5 0 0 1 0 3H7.5a1.5 1.5 0 0 1-1.5-1.5v-1.5Z" />
      <path d="M21 17.5l2.5-1.5M23.8 20.2l2.5-1.5" />
    </svg>
  );
};

export const ProductPlaceholder = ({
  categoryName = '',
  label = '',
  sku = '',
  size = 'md',
  showLabel = true,
}) => {
  const iconType = categoryName || label;
  return (
    <div className="w-full h-full paola-card-texture bg-surface-elevated flex flex-col items-center justify-center p-4 text-center relative overflow-hidden select-none">
      <div
        className="absolute inset-2.5 border border-border rounded-lg pointer-events-none"
        aria-hidden="true"
      />

      <div
        className={`${
          size === 'sm' ? 'w-10 h-10 mb-1' : 'w-14 h-14 mb-2.5'
        } rounded-full bg-surface/90 border border-border flex items-center justify-center text-brand shadow-sm transition-transform duration-300 group-hover:scale-105`}
      >
        <FootwearMinimalIcon
          type={iconType}
          className={size === 'lg' ? 'w-9 h-9' : size === 'sm' ? 'w-5 h-5' : 'w-7 h-7'}
        />
      </div>

      {showLabel && <BrandLogo variant="vertical" size="sm" />}

      {showLabel && sku && (
        <span className="mt-2 px-2 py-0.5 rounded bg-surface/85 border border-border text-[10px] font-mono text-content-secondary tracking-wider">
          Cód. {sku}
        </span>
      )}
    </div>
  );
};

export default ProductPlaceholder;
