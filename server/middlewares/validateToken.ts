import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { AuthModel, AuthUser } from "../db_models/auth";
import { UserProfileModel } from "../db_models/user_profile";

// Extend Express Request interface to include 'user'
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}


export const validateToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).json({ error: "Server configuration error" });
    }
    try {
        const decodedJwt = jwt.verify(token, secret)
        console.log("Decoded token:", decodedJwt);
        const authorizedUser = await AuthModel.findOne({ _id: decodedJwt.sub })
        if (!authorizedUser || !authorizedUser.active) {
            return res.status(401).json({ error: "User not found" });
        } else {
            req.user = authorizedUser;
            next();
        }
    } catch (error) {
        console.error("Token validation failed: ", error);
        res.status(401).json({ error: "Invalid token" });

    }

}