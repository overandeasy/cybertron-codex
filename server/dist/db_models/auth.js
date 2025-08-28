"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const authSchema = new mongoose_1.default.Schema({
    // Don't need _id field, Mongoose adds it automatically
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true },
    profile_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'user_profiles', // Use the UserProfileModel's model name
        required: true,
    }
}, { timestamps: true, collection: "auth" }); // Automatically manage createdAt and updatedAt fields
exports.AuthModel = mongoose_1.default.model("auth", authSchema);
