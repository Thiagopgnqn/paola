import React from 'react';
import { Link } from 'react-router-dom';
import useCart from '../hooks/useCart';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import Button from '../components/ui/Button';
import { FiArrowRight, FiShield } from 'react-icons/fi';
import themeConfig from '../config/theme';
import useSEO from '../hooks/useSEO';

const CartPage = () => {
  const { items } = useCart();

  useSEO({
    title: 'Tu Carrito',
    description: `Revisá tu pedido en ${themeConfig.brand.name}. Venta por mayor y por menor en Córdoba.`,
  });

  return (
    <div className="bg-canvas min-h-[75vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="mb-8 pb-4 border-b border-border">
          <span className="text-[11px] uppercase tracking-widest text-brand-deep font-bold">
            Tu Selección
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-content mt-1">
            Carrito de Compras
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="relative overflow-hidden text-center py-16 sm:py-20 px-6 paola-card-texture rounded-2xl border border-border max-w-lg mx-auto shadow-lifted">
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-border bg-surface flex items-center justify-center text-brand shadow-sm">
                <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8 stroke-current" strokeWidth="1.5">
                  <path d="M12 16h24l-2 22a3 3 0 01-3 3H17a3 3 0 01-3-3l-2-22z" />
                  <path d="M18 16v-3a6 6 0 0112 0v3" />
                </svg>
              </div>
              <h2 className="font-display font-bold text-lg text-content mb-2">
                Tu carrito está vacío
              </h2>
              <p className="text-content-secondary text-xs sm:text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                Explorá nuestro catálogo de calzado por mayor y por menor y elegí tus pares favoritos.
              </p>
              <Link to="/catalogo">
                <Button variant="primary" size="lg" className="px-6 text-xs sm:text-sm">
                  <span>Explorar Catálogo</span>
                  <FiArrowRight className="ml-2 text-xs" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-10 lg:items-start">
            {/* Lista de productos */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-surface p-6 sm:p-7 rounded-xl border border-border shadow-soft">
                <div className="divide-y divide-border-subtle">
                  {items.map((item) => (
                    <CartItem
                      key={item.key || `${item.product._id || item.product.id}__${item.variant?.id || 'base'}`}
                      item={item}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-surface-elevated border border-border rounded-xl p-4 flex items-start gap-3">
                <FiShield className="text-brand-deep mt-0.5 flex-shrink-0" />
                <div className="text-xs text-content-secondary space-y-1">
                  <p className="text-content font-semibold">{themeConfig.policies.shippingNotice}</p>
                  <p>{themeConfig.policies.returnsPolicyNotice}</p>
                </div>
              </div>
            </div>

            {/* Resumen de compra */}
            <div className="lg:col-span-5 mt-8 lg:mt-0">
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
