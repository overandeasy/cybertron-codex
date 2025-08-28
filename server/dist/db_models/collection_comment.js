"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const collectionCommentSchema = new mongoose_1.default.Schema({
    collection_item_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'user_collections',
        required: true,
    },
    user_profile_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'user_profiles',
        required: true,
    },
    content: { type: String, required: true },
}, { timestamps: true, collection: 'collection_comments' });
const CollectionCommentModel = mongoose_1.default.model('collection_comments', collectionCommentSchema);
exports.default = CollectionCommentModel;
