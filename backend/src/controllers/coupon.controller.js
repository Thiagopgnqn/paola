import * as couponService from '../services/coupon.service.js';

export const getCoupons = async (req, res, next) => {
  try {
    const list = await couponService.getCoupons(req.query);
    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const getCouponById = async (req, res, next) => {
  try {
    const coupon = await couponService.getCouponById(req.params.id);
    res.json(coupon);
  } catch (err) {
    next(err);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const created = await couponService.createCoupon(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const updated = await couponService.updateCoupon(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const result = await couponService.deleteCoupon(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const toggleCoupon = async (req, res, next) => {
  try {
    const updated = await couponService.toggleCoupon(req.params.id);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const exportCsv = async (req, res, next) => {
  try {
    const csvData = await couponService.exportCouponsCsv();
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment(`cupones-nocturna-${Date.now()}.csv`);
    res.send(csvData);
  } catch (err) {
    next(err);
  }
};
