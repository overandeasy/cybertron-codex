
import { Router } from "express";
import { addUserCollection, deleteUserCollectionItem, editUserCollectionById, getAllPublicCollections, getCollectionItemById, getMyCollection } from "../controllers/collection";
import { handleMulterError, handleMultipleFormDataFilesWithFields } from "../middlewares/handleFormDataFile";
const collectionRouter = Router();

collectionRouter.get("/all", getAllPublicCollections);
collectionRouter.get("/my-collection", getMyCollection);
collectionRouter.get("/my-collection/:collectionId", getCollectionItemById);

// Add new collection item.
collectionRouter.post("/my-collection/add", handleMultipleFormDataFilesWithFields([{ name: 'media_images', maxCount: 3 }, { name: 'toy_images', maxCount: 3 }]), addUserCollection, handleMulterError);

// Edit existing collection item.
collectionRouter.post("/my-collection/:itemId/edit", handleMultipleFormDataFilesWithFields([{ name: 'media_images', maxCount: 3 }, { name: 'toy_images', maxCount: 3 }]), editUserCollectionById, handleMulterError);

collectionRouter.delete("/my-collection/:itemId", deleteUserCollectionItem);
export default collectionRouter;