import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  FiSettings,
  FiTruck,
  FiPercent,
  FiClock,
  FiFileText,
  FiSave,
  FiCheckCircle,
  FiAlertTriangle,
  FiRefreshCw,
} from 'react-icons/fi';

const DEFAULT_SETTINGS = {
  shippingCost: 4500,
  freeShippingThreshold: 45000,
  freePickupEnabled: true,
  transferDiscountPercent: 10,
  transferDiscountEnabled: true,
  priceHistoryDays: 30,
  generalTermsText: 'Venta de calzado por mayor y por menor en Córdoba. Consultá disponibilidad de talles y mínimos mayoristas.',
  shippingNoticeText: 'Envíos en [ZONA DE ENVÍO] — [COSTOS Y PLAZOS DE ENVÍO].',
  bankTransferInstructions: 'Transferencia bancaria. Te enviaremos los datos de CBU y Alias al confirmar el pedido por WhatsApp.',
};

const SettingsPage = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await client.get('/settings');
      if (res.data) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...res.data,
        });
      }
    } catch (err) {
      console.warn('Error al cargar configuración:', err);
      setErrorMessage('No se pudo cargar la configuración remota. Mostrando valores locales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSuccessMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const payload = {
        shippingCost: Math.max(0, Math.round(Number(settings.shippingCost) || 0)),
        freeShippingThreshold: Math.max(0, Math.round(Number(settings.freeShippingThreshold) || 0)),
        freePickupEnabled: Boolean(settings.freePickupEnabled),
        transferDiscountPercent: Math.max(0, Math.min(100, Math.round(Number(settings.transferDiscountPercent) || 0))),
        transferDiscountEnabled: Boolean(settings.transferDiscountEnabled),
        priceHistoryDays: Math.max(1, Math.round(Number(settings.priceHistoryDays) || 30)),
        generalTermsText: settings.generalTermsText || '',
        shippingNoticeText: settings.shippingNoticeText || '',
        bankTransferInstructions: settings.bankTransferInstructions || '',
      };

      const res = await client.put('/settings', payload);
      if (res.data) {
        setSettings((prev) => ({ ...prev, ...res.data }));
      }
      setSuccessMessage('¡Configuración de la tienda guardada exitosamente!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error al guardar configuración:', err);
      setErrorMessage(err.response?.data?.error || err.message || 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('¿Deseás restaurar los valores de configuración por defecto?')) {
      setSettings(DEFAULT_SETTINGS);
      setSuccessMessage('');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FiRefreshCw className="w-8 h-8 text-brand-deep animate-spin mb-3" />
        <p className="text-sm text-content-secondary">Cargando configuración de la tienda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-content flex items-center gap-2.5">
            <FiSettings className="text-brand-deep" />
            Configuración de la Tienda
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Administrá valores de envíos, bonificación por transferencia, reglas de historial de precios y textos generales.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 text-xs font-semibold text-content bg-surface border border-border-strong hover:bg-surface-elevated rounded-lg transition-colors flex items-center gap-1.5"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            Restaurar Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-deep rounded-lg shadow-soft transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <FiSave className="w-3.5 h-3.5" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-status-success-bg border border-status-success-border text-status-success text-xs sm:text-sm font-medium flex items-center gap-3">
          <FiCheckCircle className="w-5 h-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-status-error-bg border border-status-error-border text-status-error text-xs sm:text-sm font-medium flex items-center gap-3">
          <FiAlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border shadow-soft space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
            <FiTruck className="text-brand-deep w-5 h-5" />
            <h2 className="text-base font-bold text-content">Envíos y Logística</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                Costo Base de Envío a Domicilio ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-content-secondary">$</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={settings.shippingCost}
                  onChange={(e) => handleChange('shippingCost', e.target.value)}
                  className="w-full bg-surface border border-border-strong rounded-lg pl-7 pr-3 py-2 text-sm text-content focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  required
                />
              </div>
              <p className="text-[11px] text-content-secondary mt-1">
                Costo estándar aplicado cuando no se alcanza el monto bonificado.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                Monto Mínimo para Envío Bonificado ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-content-secondary">$</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => handleChange('freeShippingThreshold', e.target.value)}
                  className="w-full bg-surface border border-border-strong rounded-lg pl-7 pr-3 py-2 text-sm text-content focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  required
                />
              </div>
              <p className="text-[11px] text-content-secondary mt-1">
                A partir de este subtotal el envío se bonifica automáticamente.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                Retiro en Local Gratuito
              </label>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleChange('freePickupEnabled', !settings.freePickupEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.freePickupEnabled ? 'bg-brand' : 'bg-zinc-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.freePickupEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-content">
                  {settings.freePickupEnabled ? 'Habilitado ($0 costo)' : 'Deshabilitado'}
                </span>
              </div>
              <p className="text-[11px] text-content-secondary mt-1.5">
                Permite a los clientes elegir retiro en local sin costo.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border shadow-soft space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
            <FiPercent className="text-brand-deep w-5 h-5" />
            <h2 className="text-base font-bold text-content">Descuento por Transferencia Bancaria</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                Estado del Descuento por Transferencia
              </label>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleChange('transferDiscountEnabled', !settings.transferDiscountEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.transferDiscountEnabled ? 'bg-emerald-600' : 'bg-zinc-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.transferDiscountEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-semibold text-content">
                  {settings.transferDiscountEnabled ? 'Activo' : 'Desactivado'}
                </span>
              </div>
              <p className="text-[11px] text-content-secondary mt-1.5">
                Si está desactivado, el total por transferencia coincide con el precio regular.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                Porcentaje de Bonificación (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.transferDiscountPercent}
                  onChange={(e) => handleChange('transferDiscountPercent', e.target.value)}
                  disabled={!settings.transferDiscountEnabled}
                  className="w-full bg-surface border border-border-strong rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand disabled:opacity-50"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-content-secondary font-bold">%</span>
              </div>
              <p className="text-[11px] text-content-secondary mt-1">
                Se aplica únicamente sobre el subtotal de productos (no sobre el costo de envío).
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border shadow-soft space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
            <FiClock className="text-brand-deep w-5 h-5" />
            <h2 className="text-base font-bold text-content">Reglas Legales de Precios e Historial</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1.5">
              Días Mínimos Requeridos en Historial de Precios (Defensa del Consumidor)
            </label>
            <div className="w-full sm:w-1/2">
              <input
                type="number"
                min="1"
                max="365"
                value={settings.priceHistoryDays}
                onChange={(e) => handleChange('priceHistoryDays', e.target.value)}
                className="w-full bg-surface border border-border-strong rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                required
              />
            </div>
            <p className="text-[11px] text-content-secondary mt-1.5">
              Período de referencia (default 30 días). El precio tachado solo se muestra si el historial real comprueba vigencia durante este plazo.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border shadow-soft space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
            <FiFileText className="text-brand-deep w-5 h-5" />
            <h2 className="text-base font-bold text-content">Textos Informativos y Condiciones</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                Texto de Condiciones Generales (Mayor y Menor)
              </label>
              <textarea
                rows={3}
                value={settings.generalTermsText || ''}
                onChange={(e) => handleChange('generalTermsText', e.target.value)}
                className="w-full bg-surface border border-border-strong rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="Venta de calzado por mayor y por menor en Córdoba..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                Aviso de Envíos
              </label>
              <textarea
                rows={2}
                value={settings.shippingNoticeText || ''}
                onChange={(e) => handleChange('shippingNoticeText', e.target.value)}
                className="w-full bg-surface border border-border-strong rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="Envíos en [ZONA DE ENVÍO]..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1.5">
                Instrucciones para Transferencia Bancaria
              </label>
              <textarea
                rows={2}
                value={settings.bankTransferInstructions || ''}
                onChange={(e) => handleChange('bankTransferInstructions', e.target.value)}
                className="w-full bg-surface border border-border-strong rounded-lg px-3 py-2 text-sm text-content focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="Te enviaremos los datos de CBU y Alias al confirmar el pedido por WhatsApp..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 text-sm font-semibold text-white bg-brand hover:bg-brand-deep rounded-xl shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                Guardando configuración...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                Guardar Configuración
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
