import express from 'express';
import { getActiveUserProfile, getAllUserProfiles, updateUserProfile } from '../controllers/user';
import { handleFormDataFile, handleMulterResponse } from '../middlewares/handleFormDataFile';



const userRouter = express.Router();

userRouter.get("/all", getAllUserProfiles);
userRouter.get("/me", getActiveUserProfile);

userRouter.patch("/me/edit", handleFormDataFile.single('profile_image'), handleMulterResponse, updateUserProfile);

export default userRouter;



