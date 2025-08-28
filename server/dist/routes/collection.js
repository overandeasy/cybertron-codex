"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const collection_1 = require("../controllers/collection");
const collection_2 = require("../controllers/collection");
const handleFormDataFile_1 = require("../middlewares/handleFormDataFile");
const collectionRouter = (0, express_1.Router)();
collectionRouter.get("/all", collection_1.getAllPublicCollections);
collectionRouter.get("/my-collection", collection_1.getMyCollection);
// Favorites - register these before the dynamic /my-collection/:collectionId
// so the literal path `favorites` isn't captured by the :collectionId param.
collectionRouter.get('/my-collection/favorites', collection_1.getMyFavorites);
collectionRouter.post('/my-collection/:collectionId/favorite', collection_1.addFavorite);
collectionRouter.delete('/my-collection/:collectionId/favorite', collection_1.removeFavorite);
collectionRouter.get("/my-collection/:collectionId", collection_1.getCollectionItemById);
// Add new collection item.
collectionRouter.post("/my-collection/add", (0, handleFormDataFile_1.handleMultipleFormDataFilesWithFields)([{ name: 'media_images', maxCount: 3 }, { name: 'toy_images', maxCount: 3 }]), collection_1.addUserCollection, handleFormDataFile_1.handleMulterError);
// Edit existing collection item.
collectionRouter.post("/my-collection/:itemId/edit", (0, handleFormDataFile_1.handleMultipleFormDataFilesWithFields)([{ name: 'media_images', maxCount: 3 }, { name: 'toy_images', maxCount: 3 }]), collection_1.editUserCollectionById, handleFormDataFile_1.handleMulterError);
collectionRouter.delete("/my-collection/:itemId", collection_1.deleteUserCollectionItem);
// Comments
collectionRouter.get('/my-collection/:collectionId/comments', collection_2.getCommentsForCollection);
collectionRouter.post('/my-collection/:collectionId/comments', collection_2.addCommentToCollection);
collectionRouter.patch('/my-collection/:collectionId/comments/:commentId', collection_1.editComment);
collectionRouter.delete('/my-collection/:collectionId/comments/:commentId', collection_1.deleteComment);
// Favorites
collectionRouter.get('/my-collection/favorites', collection_1.getMyFavorites);
collectionRouter.post('/my-collection/:collectionId/favorite', collection_1.addFavorite);
collectionRouter.delete('/my-collection/:collectionId/favorite', collection_1.removeFavorite);
exports.default = collectionRouter;
