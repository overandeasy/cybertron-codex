import express from 'express';
import { getActiveUserProfile, getAllUserProfiles, loginUser, registerUser } from '../controllers/user';


const userRouter = express.Router();

userRouter.get("/all", getAllUserProfiles);
userRouter.get("/me", getActiveUserProfile);


export default userRouter;



