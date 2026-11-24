import * as auditService from '../services/audit.service.js';

export const getPriceHistory = async (req, res, next) => {
  try {
    const data = await auditService.getPriceHistory(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getMarketingMetrics = async (req, res, next) => {
  try {
    const data = await auditService.getMarketingMetrics(req.query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
