/**
 * CONFIGURACIÓN CENTRAL DE MARCA Y TEMA — PAOLA CALZADOS
 * Tienda de calzado por mayor y por menor en Córdoba, Argentina.
 *
 * IMPORTANTE: Los datos aún no confirmados con la clienta permanecen
 * expresamente marcados entre corchetes [PLACEHOLDER].
 */

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

const DEMO_WHATSAPP_TEST = String(
  import.meta.env.VITE_DEMO_WHATSAPP || '5493510000000'
).replace(/\D/g, '');

const SHIPPING_NOTICE =
  'Envíos en [ZONA DE ENVÍO] — [COSTOS Y PLAZOS DE ENVÍO]. También podés retirar en [DIRECCIÓN DEL LOCAL] en [HORARIOS].';

const RETURNS_POLICY_NOTICE =
  'Cambios y devoluciones: [PLAZO DE CAMBIOS] · [CONDICIONES DE CAMBIO POR TALLE O FALLA].';

const WHOLESALE_NOTICE =
  'Venta por mayor y por menor. Compra mayorista: [MÍNIMO DE COMPRA MAYORISTA].';

const REGRET_BUTTON_NOTICE =
  '[TEXTO Y CANAL DE GESTIÓN DEL BOTÓN DE ARREPENTIMIENTO — VERIFICAR NORMATIVA VIGENTE (LEY 24.240 / RES. 424/2020 SCI)]';

const resolveWhatsAppDigits = (raw) => {
  const val = String(raw || '').trim();
  if (!val || val.includes('[') || val.includes(']')) return null;
  const digits = val.replace(/\D/g, '');
  return digits.length >= 8 ? digits : null;
};

/**
 * Construye un enlace seguro a WhatsApp.
 * Si no hay número real configurado:
 * - En modo demo usa el número ficticio de prueba (TEST).
 * - En producción devuelve null para evitar enlaces rotos.
 */
export const buildWhatsAppUrl = (message = '') => {
  const configured = resolveWhatsAppDigits(import.meta.env.VITE_DEMO_WHATSAPP);
  const digits = configured || (isDemoMode ? DEMO_WHATSAPP_TEST : null);
  if (!digits) return null;
  const textParam = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${textParam}`;
};

const FAQ_ITEMS = [
  {
    question: '¿Venden por mayor y por menor?',
    answer:
      'Sí, en Paola Calzados vendemos tanto por menor (desde 1 par) como por mayor para comercios y revendedores. Para compras mayoristas: [MÍNIMO DE COMPRA MAYORISTA].',
  },
  {
    question: '¿Cómo funcionan los envíos y el retiro en Córdoba?',
    answer:
      'Realizamos envíos en [ZONA DE ENVÍO] ([COSTOS Y PLAZOS DE ENVÍO]). También podés retirar tu pedido por nuestro local en [DIRECCIÓN DEL LOCAL] dentro del horario de [HORARIOS], coordinando previamente por WhatsApp.',
  },
  {
    question: '¿Qué medios de pago aceptan?',
    answer:
      'Podés abonar por transferencia bancaria (con el descuento configurado en tienda si corresponde) o coordinar otros medios disponibles al confirmar tu pedido por WhatsApp.',
  },
  {
    question: '¿Cómo consulto disponibilidad de talles o modelos?',
    answer:
      'Escribinos directo por WhatsApp o por Instagram (@paola_calzadoss) con el nombre o código del calzado y te confirmamos los talles y colores disponibles en stock.',
  },
  {
    question: '¿Cuál es la política de cambios y devoluciones?',
    answer:
      'Los cambios se gestionan dentro de [PLAZO DE CAMBIOS] cumpliendo con [CONDICIONES DE CAMBIO POR TALLE O FALLA]. Para iniciar una gestión escribinos por WhatsApp o a [EMAIL].',
  },
];

export const themeConfig = {
  brand: {
    name: 'Paola Calzados',
    shortName: 'Paola',
    subtitle: 'Calzados',
    fullName: 'PAOLA CALZADOS',
    tagline: 'Calzado por mayor y por menor · Córdoba, Argentina',
    logo: '/brand/logo-horizontal.svg',
    logoVertical: '/brand/logo-vertical.svg',
    ogImage: '/images/brand/og-image.png',
    favicon: '/favicon.svg',
    description:
      'Tienda de calzado por mayor y por menor en Córdoba, Argentina. Modelos para mujer, hombre, niños y niñas: zapatillas, sandalias y urbanos con atención directa por WhatsApp.',
    currencySymbol: '$',
    currencyCode: 'ARS',
    unitName: 'par',
    unitNamePlural: 'pares',
  },

  navigation: [
    { label: 'Inicio', href: '/' },
    { label: 'Catálogo', href: '/catalogo' },
    { label: 'Mujer', href: '/catalogo?category=mujer' },
    { label: 'Hombre', href: '/catalogo?category=hombre' },
    { label: 'Niños y Niñas', href: '/catalogo?category=ninos' },
    { label: 'Sandalias', href: '/catalogo?category=sandalias' },
    { label: 'Zapatillas', href: '/catalogo?category=zapatillas' },
    { label: 'Ofertas', href: '/ofertas' },
  ],

  benefits: [
    {
      id: 'wholesale',
      title: 'Por mayor y por menor',
      description:
        'Comprá desde 1 par o armá tu pedido mayorista ([MÍNIMO DE COMPRA MAYORISTA]).',
    },
    {
      id: 'shipping',
      title: 'Envíos y retiro',
      description:
        'Entregas en [ZONA DE ENVÍO] ([COSTOS Y PLAZOS DE ENVÍO]) o retiro en [DIRECCIÓN DEL LOCAL].',
    },
    {
      id: 'whatsapp',
      title: 'Atención por WhatsApp',
      description:
        'Consultá talles, colores, curvas mayoristas y disponibilidad de forma directa.',
    },
    {
      id: 'transfer',
      title: 'Beneficio por transferencia',
      description:
        'Ahorrá en el total de tu compra abonando por transferencia bancaria según promos vigentes.',
    },
  ],

  featuredCategories: [
    {
      id: 'mujer',
      slug: 'mujer',
      title: 'Mujer',
      subtitle: 'Botas, borcegos, chatitas y urbanos',
      description:
        'Calzado femenino de temporada para todos los días y ocasiones especiales.',
      iconType: 'mujer',
    },
    {
      id: 'hombre',
      slug: 'hombre',
      title: 'Hombre',
      subtitle: 'Urbanos, borcegos y náuticos',
      description:
        'Modelos versátiles y cómodos para uso diario o formal.',
      iconType: 'hombre',
    },
    {
      id: 'ninos',
      slug: 'ninos',
      title: 'Niños',
      subtitle: 'Deportivas, urbanas y escolares',
      description:
        'Calzado resistente y liviano pensado para acompañar cada actividad.',
      iconType: 'ninos',
    },
    {
      id: 'ninas',
      slug: 'ninas',
      title: 'Niñas',
      subtitle: 'Guillerminas, deportivas y sandalias',
      description:
        'Diseños cómodos y coloridos con abrojo, cordones o hebilla.',
      iconType: 'ninas',
    },
    {
      id: 'sandalias',
      slug: 'sandalias',
      title: 'Sandalias',
      subtitle: 'Plataformas, fajas bajas y ojotas',
      description:
        'Opciones frescas y livianas de verano con distintas alturas de base.',
      iconType: 'sandalias',
    },
    {
      id: 'zapatillas',
      slug: 'zapatillas',
      title: 'Zapatillas',
      subtitle: 'Urbanas, plataformas y deportivas',
      description:
        'Líneas urbanas y deportivas para renovar stock por mayor o elegir tu par.',
      iconType: 'zapatillas',
    },
  ],

  policies: {
    shippingNotice: SHIPPING_NOTICE,
    returnsPolicyNotice: RETURNS_POLICY_NOTICE,
    wholesaleNotice: WHOLESALE_NOTICE,
    regretButtonNotice: REGRET_BUTTON_NOTICE,
    exchangeWindow: '[PLAZO DE CAMBIOS]',
    exchangeConditions: '[CONDICIONES DE CAMBIO POR TALLE O FALLA]',
    wholesaleMinimum: '[MÍNIMO DE COMPRA MAYORISTA]',
    shippingCostsAndTimes: '[COSTOS Y PLAZOS DE ENVÍO]',
  },

  shippingNotice: SHIPPING_NOTICE,
  returnPolicyNotice: RETURNS_POLICY_NOTICE,

  faq: FAQ_ITEMS,
  faqs: FAQ_ITEMS,

  contact: {
    city: 'Córdoba, Argentina',
    address: '[DIRECCIÓN DEL LOCAL]',
    deliveryZone: '[ZONA DE ENVÍO]',
    phone: '[WHATSAPP]',
    phoneDisplay: '[WHATSAPP]',
    whatsapp: isDemoMode ? DEMO_WHATSAPP_TEST : '[WHATSAPP]',
    whatsappNumber: isDemoMode ? DEMO_WHATSAPP_TEST : '[WHATSAPP]',
    whatsappTestNumber: DEMO_WHATSAPP_TEST,
    isWhatsAppTestMode: isDemoMode && !resolveWhatsAppDigits(import.meta.env.VITE_DEMO_WHATSAPP),
    whatsappDefaultMessage:
      'Hola Paola Calzados, quería hacer una consulta sobre calzado por mayor o menor.',
    buildWhatsAppUrl,
    hours: '[HORARIOS]',
    schedule: '[HORARIOS]',
    email: '[EMAIL]',
    instagram: '@paola_calzadoss',
    instagramUrl: 'https://www.instagram.com/paola_calzadoss/',
    legalEntity: '[RAZÓN SOCIAL / CUIT]',
    legalName: '[RAZÓN SOCIAL / CUIT]',
  },

  legal: {
    copyright: `© ${new Date().getFullYear()} Paola Calzados ([RAZÓN SOCIAL / CUIT]). Todos los derechos reservados.`,
    note: WHOLESALE_NOTICE,
    shippingNotice: SHIPPING_NOTICE,
    returnsPolicyNotice: RETURNS_POLICY_NOTICE,
    regretButtonNotice: REGRET_BUTTON_NOTICE,
  },
};

export default themeConfig;
