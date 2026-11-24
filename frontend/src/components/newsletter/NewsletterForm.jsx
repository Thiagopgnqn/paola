import React, { useState } from 'react';
import client from '../../api/client';
import { FiMail, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi';

export default function NewsletterForm({
  title = 'Suscribite a nuestro Newsletter',
  subtitle = 'Recibí novedades de temporada, ingresos por mayor y promociones vigentes.',
  compact = false,
  className = '',
}) {
  const [email, setEmail] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);
  const [unsubEmail, setUnsubEmail] = useState('');
  const [unsubLoading, setUnsubLoading] = useState(false);
  const [unsubMessage, setUnsubMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Por favor, ingresá un correo electrónico válido.');
      return;
    }
    if (!consentGiven) {
      setStatus('error');
      setMessage('Debés tildar la casilla de consentimiento para suscribirte (Ley 25.326).');
      return;
    }

    setLoading(true);
    setStatus(null);
    setMessage('');

    try {
      const res = await client.post('/newsletter/subscribe', {
        email: email.trim().toLowerCase(),
        consentGiven: true,
      });
      setStatus('success');
      setMessage(res.data?.message || '¡Te suscribiste con éxito!');
      setEmail('');
      setConsentGiven(false);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || err.response?.data?.message || 'No se pudo registrar la suscripción.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    if (!unsubEmail || !unsubEmail.includes('@')) {
      setUnsubMessage('Ingresá tu correo para gestionar la baja.');
      return;
    }
    setUnsubLoading(true);
    try {
      const res = await client.post('/newsletter/unsubscribe', {
        email: unsubEmail.trim().toLowerCase(),
      });
      setUnsubMessage(res.data?.message || 'Baja procesada exitosamente.');
      setTimeout(() => {
        setShowUnsubscribeModal(false);
        setUnsubMessage('');
        setUnsubEmail('');
      }, 2500);
    } catch (err) {
      setUnsubMessage(err.response?.data?.error || 'No se pudo procesar la baja.');
    } finally {
      setUnsubLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`${compact ? 'p-4' : 'p-6 sm:p-8'} rounded-2xl bg-surface-elevated border border-border text-content shadow-soft`}>
        <div className="max-w-xl mx-auto text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-surface text-brand-deep flex items-center justify-center border border-border shadow-sm">
            <FiMail className="w-6 h-6" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold font-display text-content tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-content-secondary mt-1 mb-5">
            {subtitle}
          </p>

          {status === 'success' ? (
            <div className="p-4 rounded-xl bg-status-success-bg border border-status-success-border text-status-success text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
              <FiCheck className="w-5 h-5 flex-shrink-0" />
              <span>{message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-secondary">
                    <FiMail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Tu correo electrónico..."
                    disabled={loading}
                    className="w-full pl-9 pr-3 py-2.5 bg-surface border border-border-strong focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-xl text-content text-xs sm:text-sm placeholder:text-content-secondary/70 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-brand hover:bg-brand-deep disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl transition shadow-soft flex items-center justify-center gap-2 flex-shrink-0"
                >
                  {loading ? 'Suscribiendo...' : 'Suscribirme'}
                </button>
              </div>

              {/* Consentimiento (Ley 25.326) */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="newsletter-consent"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 rounded border-border-strong bg-surface text-brand focus:ring-brand focus:ring-offset-0 cursor-pointer"
                />
                <label
                  htmlFor="newsletter-consent"
                  className="text-[11px] text-content-secondary leading-tight select-none cursor-pointer"
                >
                  Acepto recibir novedades, ofertas y promociones de Paola Calzados de acuerdo con la{' '}
                  <span className="text-content font-semibold">Ley 25.326 de Protección de Datos Personales</span>. Podés cancelar tu suscripción en cualquier momento.
                </label>
              </div>

              {status === 'error' && (
                <div className="p-2.5 rounded-lg bg-status-error-bg border border-status-error-border text-status-error text-xs font-medium flex items-center gap-2">
                  <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowUnsubscribeModal(true)}
                  className="text-[11px] text-content-secondary hover:text-brand-deep underline transition font-medium"
                >
                  ¿Ya estás suscripto y querés darte de baja?
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Modal de Desuscripción */}
      {showUnsubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141014]/50 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 text-content shadow-overlay space-y-4">
            <h4 className="text-base font-bold text-content flex items-center gap-2">
              <FiInfo className="text-brand-deep" />
              <span>Darse de baja del Newsletter</span>
            </h4>
            <p className="text-xs text-content-secondary leading-relaxed">
              Respetamos tus datos personales conforme a la Ley 25.326. Si ya no deseás recibir nuestros correos, ingresá tu email para procesar la baja inmediata de nuestra base.
            </p>

            <form onSubmit={handleUnsubscribe} className="space-y-3">
              <input
                type="email"
                value={unsubEmail}
                onChange={(e) => setUnsubEmail(e.target.value)}
                placeholder="Ingresá tu correo..."
                className="w-full px-3 py-2 bg-surface border border-border-strong rounded-lg text-xs text-content focus:outline-none focus:border-brand"
              />

              {unsubMessage && (
                <p className="text-xs text-brand-deep font-semibold">{unsubMessage}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnsubscribeModal(false)}
                  className="px-3 py-1.5 bg-surface-elevated hover:bg-surface-hover border border-border text-content text-xs font-medium rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={unsubLoading}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                >
                  {unsubLoading ? 'Procesando...' : 'Confirmar baja'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
