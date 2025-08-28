import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { AuthModel, AuthUser } from "../db_models/auth";
import { UserProfileModel } from "../db_models/user_profile";
import { handleError } from "../utils/handleServerApiResponse";

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
        return handleError(res, {
            type: 'error',
            status: 401,
            code: 'NO_TOKEN',
            message: "No token provided"
        });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return handleError(res, {
            type: 'error',
            status: 500,
            code: 'SERVER_ERROR',
            message: "Server configuration error",
            data: "Missing JWT_SECRET"
        });
    }
    try {
        const decodedJwt = jwt.verify(token, secret)
        // console.log("Decoded token:", decodedJwt);
        console.log("Token validated and decoded");
    const lookupStart = Date.now();
    const authorizedUser = await AuthModel.findOne({ _id: decodedJwt.sub })
    console.log(`[validateToken] Auth lookup took ${Date.now() - lookupStart}ms`);
        if (!authorizedUser || !authorizedUser.active) {
            return handleError(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: "User not found"
            });
        } else {
            req.user = authorizedUser;
            next();
        }
    } catch (error) {
        // console.error("Token validation failed: ", error);
        return handleError(res, {
            type: 'error',
            status: 401,
            code: 'UNAUTHORIZED',
            message: "Invalid token",
            data: error
        });

    }

}