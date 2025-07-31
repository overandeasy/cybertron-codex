import express from 'express';
import { getAllUserProfiles, loginUser, registerUser } from '../controllers/user';


const userRouter = express.Router();

userRouter.get("/users", getAllUserProfiles)
userRouter.get("/users/:id", getAllUserProfiles);
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

export default userRouter;



