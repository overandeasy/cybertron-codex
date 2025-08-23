import express from 'express';
import { getActiveUserProfile, getAllUserProfiles, updateUserProfile } from '../controllers/user';
import { handleFormDataFile, handleMulterError, handleSingleFormDataFile, } from '../middlewares/handleFormDataFile';



const userRouter = express.Router();

userRouter.get("/all", getAllUserProfiles);
userRouter.get("/my-profile", getActiveUserProfile);

userRouter.patch("/my-profile/edit", handleSingleFormDataFile('new_profile_image'), updateUserProfile, handleMulterError);

export default userRouter;



