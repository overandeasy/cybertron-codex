"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userFavoriteSchema = new mongoose_1.default.Schema({
    user_profile_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'user_profiles',
        required: true,
    },
    collection_item_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'user_collections',
        required: true,
    },
}, { timestamps: true, collection: 'user_favorites' });
const UserFavoriteModel = mongoose_1.default.model('user_favorites', userFavoriteSchema);
exports.default = UserFavoriteModel;
