import * as cartService from '../services/cart.service.js';

export const quoteCart = async (req, res, next) => {
  try {
    const { items, couponCode, paymentMethod, customerEmail, customerPhone, shippingContext } =
      req.body;

    const quote = await cartService.getCartQuote({
      items,
      couponCode,
      paymentMethod,
      customerEmail,
      customerPhone,
      shippingContext,
    });

    res.json(quote);
  } catch (error) {
    next(error);
  }
};
