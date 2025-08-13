import express from 'express';
import { getActiveUserProfile, getAllUserProfiles, updateUserProfile } from '../controllers/user';
import { handleFormDataFile, handleMulterError, } from '../middlewares/handleFormDataFile';



const userRouter = express.Router();

userRouter.get("/all", getAllUserProfiles);
userRouter.get("/my-profile", getActiveUserProfile);

userRouter.post("/my-profile/edit", handleFormDataFile.single('new_profile_image'), updateUserProfile, handleMulterError);

export default userRouter;



