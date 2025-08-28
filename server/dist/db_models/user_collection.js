"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userCollectionSchema = new mongoose_1.default.Schema({
    character_name: { type: String, required: true },
    character_primary_faction: { type: String, required: true },
    character_description: { type: String },
    toy_line: { type: String },
    toy_class: { type: String },
    media_images: [{ type: String }],
    toy_images: [{ type: String }],
    collection_notes: { type: String },
    acquisition_date: { type: Date },
    price: { type: Number, default: 0.0 },
    currency: { type: String, default: 'USD' },
    user_profile_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'user_profiles', // Use the UserProfileModel's model name
        required: true,
    },
    acquisition_location: { type: String },
    alt_character_name: [{ name: { type: String } }],
    public: { type: Boolean, default: true }, // Corrected to Boolean and added default
}, { timestamps: true, collection: 'user_collections' } // Adds createdAt and updatedAt fields
);
const UserCollectionModel = mongoose_1.default.model('user_collections', userCollectionSchema);
exports.default = UserCollectionModel;
// This type will be used to return user collection data in places, such as the updateUserCollection controller.
