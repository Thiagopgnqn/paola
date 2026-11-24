import * as promotionService from '../services/promotion.service.js';

export const getPromotions = async (req, res, next) => {
  try {
    const list = await promotionService.getPromotions(req.query);
    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const getPromotionById = async (req, res, next) => {
  try {
    const promo = await promotionService.getPromotionById(req.params.id);
    res.json(promo);
  } catch (err) {
    next(err);
  }
};

export const createPromotion = async (req, res, next) => {
  try {
    const created = await promotionService.createPromotion(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const updatePromotion = async (req, res, next) => {
  try {
    const updated = await promotionService.updatePromotion(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deletePromotion = async (req, res, next) => {
  try {
    const result = await promotionService.deletePromotion(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const togglePromotion = async (req, res, next) => {
  try {
    const updated = await promotionService.togglePromotion(req.params.id);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
