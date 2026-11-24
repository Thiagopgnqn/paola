import { env } from '../config/env.js';

export const generateWhatsAppLink = (order, items) => {
  const isPickup = order.deliveryMethod === 'PICKUP';
  const shortId = String(order.id || '').slice(0, 8).toUpperCase();

  let message = `Hola *Nocturna SexShop*, quiero confirmar mi pedido *#${shortId}*\n\n`;
  message += `*Datos de contacto:*\n`;
  message += `• Nombre: ${order.customerName}\n`;
  message += `• Teléfono: ${order.customerPhone}\n`;
  if (order.customerEmail) {
    message += `• Email: ${order.customerEmail}\n`;
  }

  message += `\n*Modalidad de entrega:* ${
    isPickup ? 'Retiro a coordinar (Córdoba)' : 'Envío discreto a domicilio'
  }\n`;

  if (!isPickup) {
    if (order.customerProvince) {
      message += `• Provincia: ${order.customerProvince}\n`;
    }
    if (order.customerCity) {
      message += `• Ciudad: ${order.customerCity}\n`;
    }
    if (order.customerPostalCode) {
      message += `• CP: ${order.customerPostalCode}\n`;
    }
    if (order.customerProvince && order.customerAddress) {
      const streetOnly = order.customerAddress.split(',')[0]?.trim();
      if (streetOnly) {
        message += `• Dirección: ${streetOnly}\n`;
      }
    } else if (order.customerAddress) {
      message += `• Dirección: ${order.customerAddress}\n`;
    }
  }

  message += `\n*Productos seleccionados:*\n`;
  items.forEach((item) => {
    const productName = item.product?.name || 'Producto';
    const sku = item.variant?.sku || item.product?.sku;
    const variantLabel = item.variantDescription
      ? ` [${item.variantDescription}]`
      : '';
    const skuLabel = sku ? ` (Cód: ${sku})` : '';
    const unitPriceFormatted = Number(item.unitPrice || item.price || 0).toLocaleString('es-AR');
    const subtotalFormatted = Number(item.subtotal || 0).toLocaleString('es-AR');

    message += `• ${item.quantity}x ${productName}${variantLabel}${skuLabel} — $${unitPriceFormatted} c/u ($${subtotalFormatted})\n`;
  });

  const subtotalVal = Number(order.subtotal || order.total || 0);
  message += `\n*Subtotal de productos:* $${subtotalVal.toLocaleString('es-AR')}\n`;

  const itemDiscounts = (items || []).reduce(
    (sum, it) => sum + Number(it.discountAmount || 0) * Number(it.quantity || 1),
    0
  );
  if (itemDiscounts > 0) {
    message += `• Descuentos en productos: -$${itemDiscounts.toLocaleString('es-AR')}\n`;
  }

  if (order.cartDiscountsTotal > 0) {
    message += `• Promociones aplicadas: -$${Number(order.cartDiscountsTotal).toLocaleString('es-AR')}\n`;
  }

  if (order.couponCode && order.couponDiscount > 0) {
    message += `• Cupón ${order.couponCode}: -$${Number(order.couponDiscount).toLocaleString('es-AR')}\n`;
  }

  if (order.paymentMethodDiscount > 0) {
    message += `• Bonificación Transferencia (10% OFF): -$${Number(order.paymentMethodDiscount).toLocaleString('es-AR')}\n`;
  }

  if (isPickup) {
    message += `• Retiro: Sin costo\n`;
  } else if (order.shippingTotal === 0 || order.shippingDiscount > 0) {
    message += `• Envío a domicilio: ¡Gratis!\n`;
  } else if (order.shippingTotal > 0) {
    message += `• Envío a domicilio: $${Number(order.shippingTotal).toLocaleString('es-AR')}\n`;
  }

  message += `\n*Total final a abonar:* $${Number(order.total || 0).toLocaleString('es-AR')}\n`;

  const totalAhorro = Number(order.totalSavings || 0) || (itemDiscounts + Number(order.couponDiscount || 0) + Number(order.paymentMethodDiscount || 0) + Number(order.shippingDiscount || 0));
  if (totalAhorro > 0) {
    message += `*¡Ahorro total:* $${totalAhorro.toLocaleString('es-AR')}!*\n`;
  }

  if (order.comments) {
    message += `\n*Notas adicionales:* ${order.comments}\n`;
  }

  message += `\n_Solicito empaque 100% discreto sin logos. Quedo a la espera para coordinar pago y entrega._`;

  const phone = env.WHATSAPP_PHONE || '5493517572841';
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
};
