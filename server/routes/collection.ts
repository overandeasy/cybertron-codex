
import { Router } from "express";
import { addUserCollection, deleteUserCollectionItem, editUserCollectionById, getAllPublicCollections, getCollectionItemById, getMyCollection, editComment, deleteComment, getMyFavorites, addFavorite, removeFavorite } from "../controllers/collection";
import { addCommentToCollection, getCommentsForCollection } from "../controllers/collection";
import { handleMulterError, handleMultipleFormDataFilesWithFields } from "../middlewares/handleFormDataFile";
const collectionRouter = Router();

collectionRouter.get("/all", getAllPublicCollections);
collectionRouter.get("/my-collection", getMyCollection);

// Favorites - register these before the dynamic /my-collection/:collectionId
// so the literal path `favorites` isn't captured by the :collectionId param.
collectionRouter.get('/my-collection/favorites', getMyFavorites);
collectionRouter.post('/my-collection/:collectionId/favorite', addFavorite);
collectionRouter.delete('/my-collection/:collectionId/favorite', removeFavorite);

collectionRouter.get("/my-collection/:collectionId", getCollectionItemById);

// Add new collection item.
collectionRouter.post("/my-collection/add", handleMultipleFormDataFilesWithFields([{ name: 'media_images', maxCount: 3 }, { name: 'toy_images', maxCount: 3 }]), addUserCollection, handleMulterError);

// Edit existing collection item.
collectionRouter.post("/my-collection/:itemId/edit", handleMultipleFormDataFilesWithFields([{ name: 'media_images', maxCount: 3 }, { name: 'toy_images', maxCount: 3 }]), editUserCollectionById, handleMulterError);

collectionRouter.delete("/my-collection/:itemId", deleteUserCollectionItem);
// Comments
collectionRouter.get('/my-collection/:collectionId/comments', getCommentsForCollection);
collectionRouter.post('/my-collection/:collectionId/comments', addCommentToCollection);
collectionRouter.patch('/my-collection/:collectionId/comments/:commentId', editComment);
collectionRouter.delete('/my-collection/:collectionId/comments/:commentId', deleteComment);
// Favorites
collectionRouter.get('/my-collection/favorites', getMyFavorites);
collectionRouter.post('/my-collection/:collectionId/favorite', addFavorite);
collectionRouter.delete('/my-collection/:collectionId/favorite', removeFavorite);
export default collectionRouter;