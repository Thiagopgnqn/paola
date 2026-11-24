import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  FiX,
  FiCopy,
  FiCheck,
  FiDownload,
  FiShare2,
  FiExternalLink,
  FiInstagram,
  FiMail,
} from 'react-icons/fi';
import { FaWhatsapp, FaFacebook } from 'react-icons/fa';

export default function CampaignShareModal({ campaign, isOpen, onClose }) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState('instagram');
  const [qrDataUrl, setQrDataUrl] = useState('');

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://paolacalzados.example';
  const campaignSlug = campaign?.slug || '';
  const basePath = `/campanas/${campaignSlug}`;
  const baseFullUrl = `${origin}${basePath}`;

  const channels = [
    {
      id: 'instagram',
      name: 'Instagram (Bio / Historias)',
      icon: FiInstagram,
      color: 'text-brand-deep',
      utm_source: 'instagram',
      utm_medium: 'social',
      description: 'Ideal para colocar en @paola_calzadoss o stickers de historias.',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp (Chats / Difusión)',
      icon: FaWhatsapp,
      color: 'text-status-success',
      utm_source: 'whatsapp',
      utm_medium: 'chat',
      description: 'Para compartir en listas de difusión o mensajes directos.',
    },
    {
      id: 'meta_ads',
      name: 'Meta Ads (Facebook / Instagram Ads)',
      icon: FaFacebook,
      color: 'text-blue-700',
      utm_source: 'facebook',
      utm_medium: 'cpc',
      description: 'Para configurar como URL de destino en tus anuncios pagos.',
    },
    {
      id: 'newsletter',
      name: 'Email / Newsletter',
      icon: FiMail,
      color: 'text-amber-700',
      utm_source: 'newsletter',
      utm_medium: 'email',
      description: 'Para incluir en tus campañas de email marketing periódicas.',
    },
    {
      id: 'direct',
      name: 'Enlace directo (Sin UTM)',
      icon: FiExternalLink,
      color: 'text-brand-deep',
      utm_source: null,
      utm_medium: null,
      description: 'Enlace limpio a la landing page de la campaña.',
    },
  ];

  const buildUrl = (source, medium) => {
    if (!campaignSlug) return baseFullUrl;
    if (!source && !medium) return baseFullUrl;
    const params = new URLSearchParams();
    if (source) params.set('utm_source', source);
    if (medium) params.set('utm_medium', medium);
    params.set('utm_campaign', campaignSlug);
    return `${baseFullUrl}?${params.toString()}`;
  };

  const getActiveUrl = () => {
    const ch = channels.find((c) => c.id === selectedChannel);
    if (!ch) return baseFullUrl;
    return buildUrl(ch.utm_source, ch.utm_medium);
  };

  const activeUrl = getActiveUrl();

  useEffect(() => {
    if (!isOpen || !campaign || !activeUrl) return;
    let active = true;
    QRCode.toDataURL(activeUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#141014',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Error generando QR offline:', err);
      });
    return () => {
      active = false;
    };
  }, [isOpen, campaign, activeUrl]);

  const handleCopy = async (text, key) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement('textarea');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch (e) {
      console.error('Error al copiar:', e);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl || !campaign) return;
    const link = document.createElement('a');
    link.download = `QR-${campaign.slug}-${selectedChannel}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  if (!isOpen || !campaign) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141014]/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-2xl max-w-3xl w-full p-6 shadow-overlay my-8 relative text-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-elevated text-brand-deep flex items-center justify-center border border-border">
              <FiShare2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-content flex items-center gap-2">
                Compartir Campaña y Códigos QR
              </h3>
              <p className="text-xs text-content-secondary">
                Campaña:{' '}
                <span className="font-semibold text-brand-deep">{campaign.name}</span>{' '}
                <span className="text-content-secondary font-mono">({campaign.slug})</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-content-secondary hover:text-brand-deep rounded-lg hover:bg-surface-elevated transition"
            aria-label="Cerrar"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
          <div className="md:col-span-7 space-y-4">
            <h4 className="text-sm font-semibold text-content flex items-center gap-2">
              <span>Enlaces prearmados con atribución UTM</span>
              <span className="text-[10px] bg-surface-elevated text-brand-deep px-2 py-0.5 rounded-full font-mono font-bold">
                1-click copy
              </span>
            </h4>

            <div className="space-y-2.5">
              {channels.map((ch) => {
                const Icon = ch.icon;
                const link = buildUrl(ch.utm_source, ch.utm_medium);
                const isSelected = selectedChannel === ch.id;

                return (
                  <div
                    key={ch.id}
                    className={`p-3 rounded-xl border transition ${
                      isSelected
                        ? 'bg-surface-elevated border-brand ring-1 ring-brand/30'
                        : 'bg-canvas border-border hover:border-brand'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedChannel(ch.id)}
                        className="flex items-center gap-2 font-medium text-xs text-left hover:text-brand-deep"
                      >
                        <Icon className={`w-4 h-4 ${ch.color}`} />
                        <span className="text-content font-semibold">{ch.name}</span>
                        {isSelected && (
                          <span className="text-[10px] bg-brand text-white px-1.5 py-0.5 rounded font-mono font-semibold">
                            QR activo
                          </span>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopy(link, ch.id)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                            copiedKey === ch.id
                              ? 'bg-emerald-700 text-white'
                              : 'bg-surface border border-border-strong text-content hover:bg-brand hover:border-brand hover:text-white'
                          }`}
                        >
                          {copiedKey === ch.id ? (
                            <>
                              <FiCheck className="w-3.5 h-3.5" />
                              <span>¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <FiCopy className="w-3.5 h-3.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-content-secondary truncate bg-surface p-1.5 rounded border border-border select-all">
                      {link}
                    </div>
                    <p className="text-[11px] text-content-secondary mt-1">{ch.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col justify-between bg-surface-elevated/50 p-5 rounded-2xl border border-border">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-content">
                  Código QR (Offline)
                </h4>
                <span className="text-[10px] text-status-success bg-status-success-bg border border-status-success-border px-2 py-0.5 rounded font-mono font-semibold">
                  100% por código
                </span>
              </div>
              <p className="text-xs text-content-secondary mb-4">
                Generado localmente en tu navegador. Listo para imprimir en tarjetas, bolsas o carteles en el local.
              </p>

              <div className="bg-white p-3 rounded-xl shadow-soft mx-auto flex flex-col items-center justify-center border border-border">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Código QR ${campaign.name}`}
                    className="w-48 h-48 object-contain rounded"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-content-secondary">
                    Generando QR...
                  </div>
                )}
                <div className="text-[10px] text-content font-mono mt-1 text-center font-bold">
                  Paola Calzados &bull; {campaign.slug}
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={handleDownloadQR}
                disabled={!qrDataUrl}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand hover:bg-brand-deep text-white font-semibold text-xs rounded-xl transition shadow-soft disabled:opacity-50"
              >
                <FiDownload className="w-4 h-4" />
                <span>Descargar Código QR (PNG)</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(activeUrl, 'qr_url')}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-surface hover:bg-surface-elevated border border-border-strong text-content font-semibold text-xs rounded-xl transition"
              >
                {copiedKey === 'qr_url' ? (
                  <>
                    <FiCheck className="w-3.5 h-3.5 text-status-success" />
                    <span className="text-status-success">¡URL copiada!</span>
                  </>
                ) : (
                  <>
                    <FiCopy className="w-3.5 h-3.5" />
                    <span>Copiar URL del QR</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-[11px] text-content-secondary">
          <span>
            Los pedidos realizados mediante estos enlaces registrarán automáticamente la atribución en Métricas.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-surface-elevated hover:bg-surface-hover border border-border text-content rounded-lg text-xs font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
