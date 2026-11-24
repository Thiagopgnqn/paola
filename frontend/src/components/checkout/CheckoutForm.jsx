import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import Input from '../ui/Input';
import client from '../../api/client';
import { trackPurchase } from '../../utils/metaPixel';
import { formatVariantDescription } from '../../context/CartContext';
import { getStoredUTM } from '../../utils/utmTracker';
import { FaWhatsapp } from 'react-icons/fa';
import { FiCheckCircle, FiLock, FiShield, FiTruck, FiMapPin } from 'react-icons/fi';
import themeConfig from '../../config/theme';

const CheckoutForm = ({ onOrderSuccess }) => {
  const {
    items,
    cartTotal,
    clearCart,
    couponCode,
    paymentMethod,
    setPaymentMethod,
    setDeliveryMethod,
    transferDiscountPercent,
    transferDiscountEnabled,
    storeSettings,
  } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerProvince: 'Córdoba',
    customerCity: 'Córdoba Capital',
    customerPostalCode: '5000',
    customerAddress: '',
    deliveryMethod: 'DELIVERY',
    comments: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name || '',
        customerEmail: prev.customerEmail || user.email || '',
        customerPhone: prev.customerPhone || user.phone || '',
      }));
    }
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleDeliveryChange = (method) => {
    setFormData((prev) => ({
      ...prev,
      deliveryMethod: method,
      customerAddress:
        method === 'PICKUP' && !prev.customerAddress ? 'Retiro en local a coordinar' : prev.customerAddress,
    }));
    if (setDeliveryMethod) {
      setDeliveryMethod(method);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (items.length === 0) {
      setError('Tu carrito está vacío.');
      setLoading(false);
      return;
    }

    try {
      const isPickup = formData.deliveryMethod === 'PICKUP';
      const addressText = isPickup
        ? `Retiro en local (${themeConfig.contact.address})`
        : formData.customerAddress.trim();

      const fullAddress = isPickup
        ? `Retiro en ${formData.customerCity || 'Córdoba'}`
        : [
            addressText,
            formData.customerCity.trim(),
            formData.customerPostalCode.trim() ? `CP ${formData.customerPostalCode.trim()}` : '',
            formData.customerProvince.trim(),
          ]
            .filter(Boolean)
            .join(', ');

      const orderItems = items.map((item) => ({
        productId: item.product.id || item.product._id,
        variantId: item.variant?.id || null,
        variantDescription:
          item.variantDescription || formatVariantDescription(item.variant) || null,
        quantity: item.quantity,
      }));

      const orderData = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerEmail: formData.customerEmail.trim(),
        customerAddress: fullAddress,
        customerProvince: formData.customerProvince.trim() || 'Córdoba',
        customerCity: formData.customerCity.trim() || 'Córdoba',
        customerPostalCode: formData.customerPostalCode.trim() || '5000',
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: paymentMethod || 'TRANSFER',
        couponCode: couponCode ? couponCode.trim() : undefined,
        comments: formData.comments?.trim() || undefined,
        items: orderItems,
        ...getStoredUTM(),
      };

      const res = await client.post('/orders', orderData);
      const link = res.data?.whatsappLink;

      trackPurchase({
        orderId: res.data?.id,
        items,
        total: cartTotal,
      });

      if (link) {
        setWhatsappUrl(link);
        window.open(link, '_blank');
      }

      if (onOrderSuccess) {
        onOrderSuccess();
      }
      setSuccess(true);
      clearCart();
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.message ||
        'No pudimos registrar el pedido. Revisá los datos ingresados o escribinos por WhatsApp.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12 px-6 bg-surface rounded-xl border border-border shadow-soft">
        <div className="mx-auto w-12 h-12 bg-status-success-bg text-status-success rounded-full flex items-center justify-center mb-4 border border-status-success-border">
          <FiCheckCircle size={26} />
        </div>
        <span className="text-[10px] uppercase tracking-widest text-brand-deep font-bold">
          ¡Pedido Registrado!
        </span>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-content mt-1 mb-2">
          Finalizá la coordinación por WhatsApp
        </h2>
        <p className="text-content-secondary mb-6 max-w-sm mx-auto text-xs sm:text-sm leading-relaxed">
          Ya preparamos el resumen de tu pedido. Hacé clic abajo para enviarlo a nuestro WhatsApp y coordinar pago y entrega.
        </p>

        {themeConfig.contact.isWhatsAppTestMode && (
          <div className="mb-4 p-2.5 rounded-lg bg-status-warning-bg border border-status-warning-border text-status-warning text-[11px] font-medium max-w-sm mx-auto">
            Modo Demo: el enlace apunta al número ficticio de prueba ({themeConfig.contact.whatsappTestNumber} — TEST).
          </div>
        )}

        {paymentMethod === 'TRANSFER' && (
          <div className="mb-6 p-3.5 rounded-lg bg-surface-elevated border border-border text-xs text-content-secondary max-w-sm mx-auto text-left">
            <p className="font-semibold text-content mb-1">Instrucciones de Transferencia bancaria:</p>
            <p className="leading-relaxed">
              {storeSettings?.bankTransferInstructions ||
                'Te enviaremos los datos de CBU y Alias al confirmar el pedido por WhatsApp.'}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-sm mx-auto">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 bg-brand hover:bg-brand-deep text-white px-5 py-3 rounded-md font-semibold text-xs sm:text-sm transition-colors shadow-soft"
            >
              <FaWhatsapp size={18} />
              <span>Abrir WhatsApp Ahora</span>
            </a>
          ) : (
            <div className="px-4 py-2.5 rounded-md bg-surface-elevated border border-border text-xs text-content-secondary">
              WhatsApp pendiente de configurar: {themeConfig.contact.phone}
            </div>
          )}
          <Link
            to="/"
            className="flex items-center justify-center px-5 py-3 rounded-md border border-border-strong text-content text-xs font-semibold hover:bg-surface-elevated transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-soft space-y-7"
    >
      {/* Paso 1: Contacto */}
      <div>
        <div className="pb-3 mb-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-brand-deep font-bold">
              Paso 1
            </span>
            <h2 className="font-display font-bold text-base text-content mt-0.5">
              Datos de Contacto
            </h2>
          </div>
          <span className="text-xs text-content-secondary">Para coordinar tu entrega</span>
        </div>

        <div className="space-y-4">
          <Input
            label="Nombre y Apellido"
            name="customerName"
            required
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Ej: Carolina P."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Correo Electrónico"
              type="email"
              name="customerEmail"
              required
              value={formData.customerEmail}
              onChange={handleChange}
              placeholder="carolina@ejemplo.com"
            />
            <Input
              label="Teléfono / WhatsApp"
              type="tel"
              name="customerPhone"
              required
              value={formData.customerPhone}
              onChange={handleChange}
              placeholder="Ej: 351 000 0000"
            />
          </div>
        </div>
      </div>

      {/* Paso 2: Modalidad de entrega */}
      <div className="pt-2">
        <div className="pb-3 mb-4 border-b border-border-subtle">
          <span className="text-[10px] uppercase tracking-widest text-brand-deep font-bold">
            Paso 2
          </span>
          <h2 className="font-display font-bold text-base text-content mt-0.5">
            Modalidad de Entrega
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => handleDeliveryChange('DELIVERY')}
            className={`p-4 rounded-lg border text-left transition-all flex items-start gap-3 ${
              formData.deliveryMethod === 'DELIVERY'
                ? 'bg-surface-elevated border-brand text-content ring-1 ring-brand/40'
                : 'bg-surface border-border-strong text-content-secondary hover:border-brand'
            }`}
          >
            <FiTruck className="text-brand-deep mt-0.5 flex-shrink-0" size={18} />
            <div>
              <p className="text-xs font-semibold text-content">Envío a Domicilio</p>
              <p className="text-[11px] text-content-secondary mt-0.5">
                Entregas en {themeConfig.contact.deliveryZone}.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleDeliveryChange('PICKUP')}
            className={`p-4 rounded-lg border text-left transition-all flex items-start gap-3 ${
              formData.deliveryMethod === 'PICKUP'
                ? 'bg-surface-elevated border-brand text-content ring-1 ring-brand/40'
                : 'bg-surface border-border-strong text-content-secondary hover:border-brand'
            }`}
          >
            <FiMapPin className="text-brand-deep mt-0.5 flex-shrink-0" size={18} />
            <div>
              <p className="text-xs font-semibold text-content">Retiro en Local</p>
              <p className="text-[11px] text-content-secondary mt-0.5">
                {themeConfig.contact.address} ({themeConfig.contact.hours}).
              </p>
            </div>
          </button>
        </div>

        {formData.deliveryMethod === 'DELIVERY' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Provincia"
                name="customerProvince"
                required
                value={formData.customerProvince}
                onChange={handleChange}
                placeholder="Córdoba"
              />
              <Input
                label="Ciudad / Barrio"
                name="customerCity"
                required
                value={formData.customerCity}
                onChange={handleChange}
                placeholder="Ej: Nueva Córdoba, Córdoba Capital"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Código Postal"
                name="customerPostalCode"
                required
                value={formData.customerPostalCode}
                onChange={handleChange}
                placeholder="Ej: 5000"
              />
              <Input
                label="Calle, Altura y Piso/Depto"
                name="customerAddress"
                required
                value={formData.customerAddress}
                onChange={handleChange}
                placeholder="Ej: Av. Colón 450"
              />
            </div>
          </div>
        )}
      </div>

      {/* Paso 3: Método de Pago */}
      <div className="pt-2 border-t border-border-subtle">
        <div className="pb-3 mb-4 border-b border-border-subtle">
          <span className="text-[10px] uppercase tracking-widest text-brand-deep font-bold">
            Paso 3
          </span>
          <h2 className="font-display font-bold text-base text-content mt-0.5">
            Método de Pago
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
          <button
            type="button"
            onClick={() => setPaymentMethod('TRANSFER')}
            className={`p-4 rounded-lg border text-left transition-all ${
              paymentMethod === 'TRANSFER'
                ? 'bg-surface-elevated border-brand text-content ring-1 ring-brand/40'
                : 'bg-surface border-border-strong text-content-secondary hover:border-brand'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-content">Transferencia bancaria</span>
              {transferDiscountEnabled && (
                <span className="text-[10px] text-status-success font-bold bg-status-success-bg px-2 py-0.5 rounded border border-status-success-border">
                  {transferDiscountPercent}% OFF
                </span>
              )}
            </div>
            <p className="text-[11px] text-content-secondary leading-snug">
              {transferDiscountEnabled
                ? `Bonificación directa del ${transferDiscountPercent}% sobre el subtotal.`
                : 'Pago directo mediante transferencia bancaria.'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('OTHER')}
            className={`p-4 rounded-lg border text-left transition-all ${
              paymentMethod === 'OTHER'
                ? 'bg-surface-elevated border-brand text-content ring-1 ring-brand/40'
                : 'bg-surface border-border-strong text-content-secondary hover:border-brand'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-content">Efectivo / Otros Medios</span>
              <span className="text-[10px] text-content-secondary">Precio regular</span>
            </div>
            <p className="text-[11px] text-content-secondary leading-snug">
              A coordinar directamente por WhatsApp al momento de la entrega o retiro.
            </p>
          </button>
        </div>
      </div>

      {/* Paso 4: Notas */}
      <div className="pt-2 border-t border-border-subtle">
        <label className="block text-xs font-semibold text-content-secondary mb-1.5">
          Aclaraciones de talles, pedido mayorista o franja horaria (Opcional)
        </label>
        <textarea
          name="comments"
          rows="2"
          value={formData.comments}
          onChange={handleChange}
          className="block w-full rounded-md border border-border-strong bg-surface text-content text-xs sm:text-sm p-3 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-smooth placeholder:text-content-secondary/65"
          placeholder="Ej: Consultar curva de talles mayorista / Entregar por la tarde..."
        />
      </div>

      {/* Aviso de políticas */}
      <div className="p-3.5 rounded-lg bg-surface-elevated border border-border flex items-start gap-2.5 text-xs text-content-secondary">
        <FiShield className="text-brand-deep mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-content font-semibold">{themeConfig.policies.wholesaleNotice}</p>
          <p className="text-[11px] text-content-secondary mt-0.5">
            {themeConfig.policies.returnsPolicyNotice}
          </p>
        </div>
      </div>

      {error && (
        <div className="text-status-error text-xs bg-status-error-bg p-3 rounded-md border border-status-error-border font-medium">
          {error}
        </div>
      )}

      {/* Botón de Confirmación por WhatsApp */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2.5 bg-brand hover:bg-brand-deep active:scale-[0.99] text-white py-3.5 px-6 rounded-md font-semibold text-xs sm:text-sm uppercase tracking-wider transition-smooth disabled:opacity-50 shadow-soft hover:shadow-brand"
        >
          <FaWhatsapp size={18} />
          <span>{loading ? 'Procesando pedido...' : 'Hacé tu pedido por WhatsApp'}</span>
        </button>
        <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-content-secondary mt-3">
          <FiLock className="text-brand-deep text-[11px]" />
          <span>Sin ingreso de tarjetas en la web &bull; Coordinación directa con Paola Calzados</span>
        </div>
      </div>
    </form>
  );
};

export default CheckoutForm;
