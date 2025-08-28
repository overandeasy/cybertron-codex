"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../db_models/auth");
const handleServerApiResponse_1 = require("../utils/handleServerApiResponse");
const validateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return (0, handleServerApiResponse_1.handleError)(res, {
            type: 'error',
            status: 401,
            code: 'NO_TOKEN',
            message: "No token provided"
        });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return (0, handleServerApiResponse_1.handleError)(res, {
            type: 'error',
            status: 500,
            code: 'SERVER_ERROR',
            message: "Server configuration error",
            data: "Missing JWT_SECRET"
        });
    }
    try {
        const decodedJwt = jsonwebtoken_1.default.verify(token, secret);
        // console.log("Decoded token:", decodedJwt);
        console.log("Token validated and decoded");
        const lookupStart = Date.now();
        const authorizedUser = yield auth_1.AuthModel.findOne({ _id: decodedJwt.sub });
        console.log(`[validateToken] Auth lookup took ${Date.now() - lookupStart}ms`);
        if (!authorizedUser || !authorizedUser.active) {
            return (0, handleServerApiResponse_1.handleError)(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: "User not found"
            });
        }
        else {
            req.user = authorizedUser;
            next();
        }
    }
    catch (error) {
        // console.error("Token validation failed: ", error);
        return (0, handleServerApiResponse_1.handleError)(res, {
            type: 'error',
            status: 401,
            code: 'UNAUTHORIZED',
            message: "Invalid token",
            data: error
        });
    }
});
exports.validateToken = validateToken;
