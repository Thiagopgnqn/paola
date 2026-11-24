import * as settingsService from '../services/settings.service.js';

export const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getStoreSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const updated = await settingsService.updateStoreSettings(req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
