import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    brand: 'bg-brand text-white border-brand-deep font-semibold',
    pending: 'bg-status-warning-bg text-status-warning border-status-warning-border',
    confirmed: 'bg-brand text-white border-brand-deep font-semibold',
    delivered: 'bg-status-success-bg text-status-success border-status-success-border',
    cancelled: 'bg-status-error-bg text-status-error border-status-error-border',
    new: 'bg-brand text-white border-brand-deep font-semibold',
    sale: 'bg-surface-elevated text-brand-deep border-border-strong font-semibold',
    neutral: 'bg-surface-elevated text-content-secondary border-border',
    default: 'bg-surface-elevated text-content-secondary border-border',
  };

  const style = variants[variant?.toLowerCase()] || variants.default;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border ${style} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
