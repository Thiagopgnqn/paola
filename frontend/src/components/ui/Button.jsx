import React from 'react';
import Spinner from './Spinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex justify-center items-center font-semibold rounded-md transition-smooth focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-canvas select-none active:scale-[0.99] disabled:active:scale-100';

  const variants = {
    primary:
      'bg-brand text-white hover:bg-brand-deep border border-brand-deep/20 shadow-soft hover:shadow-brand',
    secondary:
      'border border-border-strong bg-surface text-content hover:bg-surface-elevated hover:border-brand shadow-soft',
    ghost:
      'text-content-secondary hover:text-brand-deep hover:bg-surface-elevated/70 border border-transparent',
    danger:
      'bg-status-error-bg text-status-error hover:bg-rose-600 hover:text-white border border-status-error-border shadow-soft',
    outline:
      'border border-brand text-brand-deep bg-transparent hover:bg-brand hover:border-brand hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-xs sm:text-sm',
    lg: 'px-6 py-3 text-sm font-semibold tracking-wide',
  };

  const width = fullWidth ? 'w-full' : '';
  const stateClasses =
    disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

  const spinnerColor = variant === 'primary' ? 'text-white' : 'text-brand';

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${width} ${stateClasses} ${className}`}
      {...props}
    >
      {loading && (
        <Spinner
          size="sm"
          className="mr-2"
          color={spinnerColor}
        />
      )}
      {children}
    </button>
  );
};

export default Button;
