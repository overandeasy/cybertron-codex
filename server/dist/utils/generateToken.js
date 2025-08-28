"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (userId, email) => {
    const token = jsonwebtoken_1.default.sign({ sub: userId, email }, process.env.JWT_SECRET, {
        expiresIn: '24h',
    });
    return token;
};
exports.default = generateToken;
