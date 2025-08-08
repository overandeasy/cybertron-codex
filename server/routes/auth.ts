import express from 'express';
import { loginUser, signUp } from '../controllers/user';

const authRouter = express.Router();

authRouter.post("/sign-up", signUp);
authRouter.post("/login", loginUser);

export default authRouter;
