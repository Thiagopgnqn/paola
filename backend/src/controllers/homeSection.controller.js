import * as homeSectionService from '../services/homeSection.service.js';

export const getHomeSections = async (req, res, next) => {
  try {
    const { campaignId, preview, activeOnly } = req.query;
    const result = await homeSectionService.getHomeSections({
      campaignId,
      previewId: preview,
      activeOnly: activeOnly === 'true',
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const createHomeSection = async (req, res, next) => {
  try {
    const section = await homeSectionService.createHomeSection(req.body);
    res.status(201).json(section);
  } catch (err) {
    next(err);
  }
};

export const updateHomeSection = async (req, res, next) => {
  try {
    const section = await homeSectionService.updateHomeSection(req.params.id, req.body);
    res.json(section);
  } catch (err) {
    next(err);
  }
};

export const deleteHomeSection = async (req, res, next) => {
  try {
    const result = await homeSectionService.deleteHomeSection(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const reorderHomeSections = async (req, res, next) => {
  try {
    const result = await homeSectionService.reorderHomeSections(req.body.items);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const applyTemplate = async (req, res, next) => {
  try {
    const { campaignId, templateKey } = req.body;
    const result = await homeSectionService.applyTemplate(campaignId, templateKey);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
