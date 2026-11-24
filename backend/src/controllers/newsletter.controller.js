import * as newsletterService from '../services/newsletter.service.js';

export const subscribe = async (req, res, next) => {
  try {
    const result = await newsletterService.subscribe(req.body);
    res.status(result.created ? 201 : 200).json(result);
  } catch (err) {
    next(err);
  }
};

export const unsubscribe = async (req, res, next) => {
  try {
    const result = await newsletterService.unsubscribe(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const listSubscribers = async (req, res, next) => {
  try {
    const result = await newsletterService.listSubscribers(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const exportCsv = async (req, res, next) => {
  try {
    const csvData = await newsletterService.generateCsv();
    const filename = `suscriptores-nocturna-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvData);
  } catch (err) {
    next(err);
  }
};
