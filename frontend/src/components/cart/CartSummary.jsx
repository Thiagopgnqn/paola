import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import Button from '../ui/Button';
import {
  FiShield,
  FiArrowRight,
  FiLock,
  FiTruck,
  FiTag,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiGift,
} from 'react-icons/fi';
import themeConfig from '../../config/theme';

const CartSummary = ({ isDrawer = false, onCloseDrawer }) => {
  const {
    cartCount,
    cartTotal,
    cartSubtotal,
    totalSavings,
    quote,
    quoteLoading,
    couponCode,
    couponError,
    couponSuccess,
    applyCoupon,
    removeCoupon,
    paymentMethod,
    setPaymentMethod,
    freeShippingThreshold,
    remainingForFreeShipping,
    freeShippingProgress,
    isFreeShipping,
    quantityPromoNotice,
    transferDiscountPercent,
    transferDiscountEnabled,
    storeSettings,
  } = useCart();

  const [inputCode, setInputCode] = useState(couponCode || '');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (inputCode.trim()) {
      applyCoupon(inputCode.trim());
    }
  };

  const totalFormatted = Number(cartTotal || 0).toLocaleString('es-AR');
  const subtotalFormatted = Number(quote?.subtotal || cartSubtotal || 0).toLocaleString('es-AR');
  const savingsFormatted = Number(totalSavings || 0).toLocaleString('es-AR');

  return (
    <div
      className={`bg-surface rounded-xl border border-border shadow-soft ${
        isDrawer ? 'p-4' : 'p-6 lg:p-7'
      } space-y-5`}
    >
      <div className="pb-3 border-b border-border-subtle">
        <h2 className="font-display font-bold text-sm uppercase tracking-wider text-content">
          Resumen del Pedido
        </h2>
        <p className="text-xs text-content-secondary mt-0.5">
          Precios transparentes y descuentos aplicados al instante
        </p>
      </div>

      {/* 1. Barra de Progreso de Envío Gratis */}
      <div className="p-3.5 rounded-lg bg-surface-elevated border border-border space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-content inline-flex items-center gap-1.5">
            <FiTruck className="text-brand-deep" />
            <span>
              {isFreeShipping
                ? '¡Tenés Envío Bonificado!'
                : `Te faltan $${remainingForFreeShipping.toLocaleString('es-AR')} para envío bonificado`}
            </span>
          </span>
          <span className="text-[11px] font-bold text-brand-deep">
            {freeShippingProgress}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface overflow-hidden border border-border">
          <div
            className="h-full bg-brand transition-all duration-500 ease-out"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
        <p className="text-[11px] text-content-secondary">
          Envío bonificado en {themeConfig.contact.deliveryZone} superando $
          {Number(freeShippingThreshold).toLocaleString('es-AR')}.
        </p>
      </div>

      {/* 2. Aviso de Promoción por Cantidad */}
      {quantityPromoNotice && (
        <div className="p-3.5 rounded-lg bg-surface-elevated border border-brand/40 flex items-start gap-2.5">
          <FiGift className="text-brand-deep mt-0.5 flex-shrink-0" size={15} />
          <div className="text-xs">
            <p className="font-semibold text-content">{quantityPromoNotice.title}</p>
            <p className="text-content-secondary mt-0.5 leading-snug">
              {quantityPromoNotice.text}
            </p>
          </div>
        </div>
      )}

      {/* 3. Selector de Método de Pago */}
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider text-content-secondary font-semibold">
          Método de Pago Preferido:
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setPaymentMethod('TRANSFER')}
            className={`p-2.5 rounded-md border text-left transition-all ${
              paymentMethod === 'TRANSFER'
                ? 'bg-surface-elevated border-brand text-content ring-1 ring-brand/40'
                : 'bg-surface border-border-strong text-content-secondary hover:text-content hover:border-brand'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-semibold">Transferencia</span>
              {transferDiscountEnabled && (
                <span className="text-[10px] text-status-success font-bold bg-status-success-bg px-1.5 py-0.5 rounded border border-status-success-border">
                  {transferDiscountPercent}% OFF
                </span>
              )}
            </div>
            <p className="text-[10px] text-content-secondary mt-1 truncate">
              {transferDiscountEnabled ? `${transferDiscountPercent}% de ahorro directo` : 'Pago por transferencia'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('OTHER')}
            className={`p-2.5 rounded-md border text-left transition-all ${
              paymentMethod === 'OTHER'
                ? 'bg-surface-elevated border-brand text-content ring-1 ring-brand/40'
                : 'bg-surface border-border-strong text-content-secondary hover:text-content hover:border-brand'
            }`}
          >
            <span className="font-semibold">Efectivo / Otro</span>
            <p className="text-[10px] text-content-secondary mt-1 truncate">
              Al retirar o coordinar
            </p>
          </button>
        </div>
      </div>

      {/* 4. Campo de Cupón con validación en vivo */}
      <div className="space-y-2 pt-2 border-t border-border-subtle">
        <label className="block text-xs uppercase tracking-wider text-content-secondary font-semibold">
          ¿Tenés un cupón de descuento?
        </label>

        {quote?.coupon ? (
          <div className="flex items-center justify-between p-2.5 rounded-md bg-status-success-bg border border-status-success-border text-xs">
            <div className="flex items-center gap-2">
              <FiTag className="text-status-success" />
              <div>
                <span className="font-mono font-bold text-content">
                  {quote.coupon.code}
                </span>
                <span className="text-status-success font-semibold ml-2">
                  (-${Number(quote.coupon.discount || 0).toLocaleString('es-AR')})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={removeCoupon}
              className="text-content-secondary hover:text-status-error p-1"
              title="Quitar cupón"
              aria-label="Quitar cupón"
            >
              <FiX size={14} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="Código de cupón"
              className="flex-1 px-3 py-2 bg-surface border border-border-strong rounded text-xs text-content placeholder:text-content-secondary/70 font-mono uppercase focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
            <Button
              type="submit"
              variant="secondary"
              disabled={quoteLoading || !inputCode.trim()}
              className="px-4 py-2 text-xs"
            >
              {quoteLoading ? 'Validando...' : 'Aplicar'}
            </Button>
          </form>
        )}

        {couponError && (
          <div className="flex items-center gap-1.5 text-xs text-status-error bg-status-error-bg border border-status-error-border px-2.5 py-1.5 rounded">
            <FiAlertCircle size={13} className="flex-shrink-0" />
            <span>{couponError}</span>
          </div>
        )}

        {couponSuccess && !couponError && (
          <div className="flex items-center gap-1.5 text-xs text-status-success bg-status-success-bg border border-status-success-border px-2.5 py-1.5 rounded">
            <FiCheck size={13} className="flex-shrink-0" />
            <span>{couponSuccess}</span>
          </div>
        )}
      </div>

      {/* 5. Desglose detallado de precios y descuentos */}
      <div className="flow-root pt-3 border-t border-border-subtle">
        <dl className="text-xs space-y-2">
          <div className="flex items-center justify-between">
            <dt className="text-content-secondary">
              Subtotal ({cartCount}{' '}
              {cartCount === 1 ? themeConfig.brand.unitName : themeConfig.brand.unitNamePlural})
            </dt>
            <dd className="font-semibold text-content">
              {themeConfig.brand.currencySymbol}
              {subtotalFormatted}
            </dd>
          </div>

          {quote?.itemDiscountsTotal > 0 && (
            <div className="flex items-center justify-between text-status-success font-medium">
              <dt>Descuentos en productos</dt>
              <dd>
                -{themeConfig.brand.currencySymbol}
                {Number(quote.itemDiscountsTotal).toLocaleString('es-AR')}
              </dd>
            </div>
          )}

          {Array.isArray(quote?.appliedPromotions) &&
            quote.appliedPromotions.map((promo) => (
              <div
                key={promo.id || promo.name}
                className="flex items-center justify-between text-status-success font-medium"
              >
                <dt className="truncate pr-2">{promo.name}</dt>
                <dd className="whitespace-nowrap">
                  -{themeConfig.brand.currencySymbol}
                  {Number(promo.discount).toLocaleString('es-AR')}
                </dd>
              </div>
            ))}

          {quote?.couponDiscount > 0 && (
            <div className="flex items-center justify-between text-status-success font-medium">
              <dt>Cupón ({quote.coupon?.code})</dt>
              <dd>
                -{themeConfig.brand.currencySymbol}
                {Number(quote.couponDiscount).toLocaleString('es-AR')}
              </dd>
            </div>
          )}

          {quote?.paymentMethodDiscount > 0 && (
            <div className="flex items-center justify-between text-status-success font-medium">
              <dt>Bonificación Transferencia ({transferDiscountPercent}%)</dt>
              <dd>
                -{themeConfig.brand.currencySymbol}
                {Number(quote.paymentMethodDiscount).toLocaleString('es-AR')}
              </dd>
            </div>
          )}

          <div className="flex items-center justify-between">
            <dt className="text-content-secondary">Envío a domicilio</dt>
            <dd className="font-semibold text-content">
              {isFreeShipping ? (
                <span className="text-status-success font-bold uppercase text-[11px] tracking-wider">
                  ¡Gratis!
                </span>
              ) : (
                `${themeConfig.brand.currencySymbol}${Number(
                  quote?.shipping?.finalCost || storeSettings?.shippingCost || 4500
                ).toLocaleString('es-AR')}`
              )}
            </dd>
          </div>

          <div className="pt-3 flex items-baseline justify-between border-t border-border">
            <dt className="text-sm font-bold text-content">Total Final</dt>
            <dd className="text-2xl font-bold text-content tracking-tight">
              {themeConfig.brand.currencySymbol}
              {totalFormatted}
            </dd>
          </div>
        </dl>

        {totalSavings > 0 && (
          <div className="mt-3 p-2.5 rounded-lg bg-status-success-bg border border-status-success-border text-center">
            <p className="text-xs font-bold text-status-success">
              ¡Ahorrás {themeConfig.brand.currencySymbol}
              {savingsFormatted} en este pedido!
            </p>
          </div>
        )}
      </div>

      {/* Aviso de compra mayorista / envíos */}
      <div className="bg-surface-elevated border border-border rounded-lg p-3 flex items-start gap-2.5">
        <FiShield className="text-brand-deep mt-0.5 flex-shrink-0 text-sm" />
        <p className="text-[11px] text-content-secondary leading-relaxed">
          {themeConfig.policies.wholesaleNotice}
        </p>
      </div>

      {/* Botón de acción */}
      <div className="pt-2">
        <Link to="/checkout" onClick={onCloseDrawer} className="w-full block">
          <Button fullWidth variant="primary" size="lg" className="text-xs sm:text-sm py-3.5">
            <FiLock className="mr-2 text-xs" />
            <span>Continuar al Checkout</span>
            <FiArrowRight className="ml-2 text-xs" />
          </Button>
        </Link>
      </div>

      <div className="text-center">
        <Link
          to="/catalogo"
          onClick={onCloseDrawer}
          className="text-xs text-content-secondary hover:text-brand-deep transition-colors font-semibold"
        >
          &larr; Seguir explorando el catálogo
        </Link>
      </div>
    </div>
  );
};

export default CartSummary;
