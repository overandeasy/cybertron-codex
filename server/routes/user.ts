import express from 'express';
import { getActiveUserProfile, getAllUserProfiles, updateUserProfile, setPrimaryProfileImage } from '../controllers/user';
import { handleFormDataFile, handleMulterError, handleSingleFormDataFile, } from '../middlewares/handleFormDataFile';



const userRouter = express.Router();

userRouter.get("/all", getAllUserProfiles);
userRouter.get("/my-profile", getActiveUserProfile);
userRouter.patch("/my-profile/edit", handleSingleFormDataFile('new_profile_image'), updateUserProfile, handleMulterError);
// Set primary profile image
userRouter.patch("/my-profile/primary-image", express.json(), setPrimaryProfileImage);

export default userRouter;



