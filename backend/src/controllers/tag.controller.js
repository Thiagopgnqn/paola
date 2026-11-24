import * as tagService from '../services/tag.service.js';

export const getTags = async (req, res, next) => {
  try {
    const list = await tagService.getTags();
    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const createTag = async (req, res, next) => {
  try {
    const created = await tagService.createTag(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const deleteTag = async (req, res, next) => {
  try {
    const result = await tagService.deleteTag(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const assignTagsToProduct = async (req, res, next) => {
  try {
    const { productId, tagIds } = req.body;
    const result = await tagService.assignTagsToProduct(productId, tagIds);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
