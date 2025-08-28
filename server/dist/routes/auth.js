"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const authRouter = express_1.default.Router();
authRouter.post("/sign-up", user_1.signUp);
authRouter.post("/login", user_1.loginUser);
exports.default = authRouter;
