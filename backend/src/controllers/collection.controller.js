import * as collectionService from '../services/collection.service.js';

export const getCollections = async (req, res, next) => {
  try {
    const list = await collectionService.getCollections();
    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const getCollectionById = async (req, res, next) => {
  try {
    const coll = await collectionService.getCollectionById(req.params.id);
    res.json(coll);
  } catch (err) {
    next(err);
  }
};

export const createCollection = async (req, res, next) => {
  try {
    const created = await collectionService.createCollection(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const updateCollection = async (req, res, next) => {
  try {
    const updated = await collectionService.updateCollection(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteCollection = async (req, res, next) => {
  try {
    const result = await collectionService.deleteCollection(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
