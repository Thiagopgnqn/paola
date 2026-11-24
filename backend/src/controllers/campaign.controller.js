import * as campaignService from '../services/campaign.service.js';

export const getCampaigns = async (req, res, next) => {
  try {
    const list = await campaignService.getCampaigns(req.query);
    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await campaignService.getCampaignById(req.params.id);
    res.json(campaign);
  } catch (err) {
    next(err);
  }
};

export const createCampaign = async (req, res, next) => {
  try {
    const created = await campaignService.createCampaign(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const updateCampaign = async (req, res, next) => {
  try {
    const updated = await campaignService.updateCampaign(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteCampaign = async (req, res, next) => {
  try {
    const result = await campaignService.deleteCampaign(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const duplicateCampaign = async (req, res, next) => {
  try {
    const duplicated = await campaignService.duplicateCampaign(req.params.id);
    res.status(201).json(duplicated);
  } catch (err) {
    next(err);
  }
};

export const updateCampaignStatus = async (req, res, next) => {
  try {
    const updated = await campaignService.updateCampaignStatus(req.params.id, req.body.status);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const endCampaign = async (req, res, next) => {
  try {
    const updated = await campaignService.endCampaign(req.params.id);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const archiveCampaign = async (req, res, next) => {
  try {
    const updated = await campaignService.archiveCampaign(req.params.id);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const getActiveCampaign = async (req, res, next) => {
  try {
    const campaign = await campaignService.getActiveCampaign(req.query.preview);
    res.json(campaign || null);
  } catch (err) {
    next(err);
  }
};

export const getPublicCampaignBySlug = async (req, res, next) => {
  try {
    const campaign = await campaignService.getCampaignBySlug(req.params.slug, req.query.preview);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }
    res.json(campaign);
  } catch (err) {
    next(err);
  }
};

export const recordCampaignView = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await campaignService.incrementCampaignViews(id);
    res.json({ success: true, views: result?.views || 0 });
  } catch (err) {
    next(err);
  }
};

export const recordCampaignViewBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await campaignService.incrementCampaignViews(slug);
    res.json({ success: true, views: result?.views || 0 });
  } catch (err) {
    next(err);
  }
};
