"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const handleFormDataFile_1 = require("../middlewares/handleFormDataFile");
const userRouter = express_1.default.Router();
userRouter.get("/all", user_1.getAllUserProfiles);
userRouter.get("/my-profile", user_1.getActiveUserProfile);
userRouter.patch("/my-profile/edit", (0, handleFormDataFile_1.handleSingleFormDataFile)('new_profile_image'), user_1.updateUserProfile, handleFormDataFile_1.handleMulterError);
// Set primary profile image
userRouter.patch("/my-profile/primary-image", express_1.default.json(), user_1.setPrimaryProfileImage);
exports.default = userRouter;
