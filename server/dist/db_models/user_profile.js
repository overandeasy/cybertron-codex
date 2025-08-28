"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileModel = exports.SOCIAL_KEYS = void 0;
const mongoose_1 = __importDefault(require("mongoose")); // Import Mongoose
exports.SOCIAL_KEYS = [
    'x', 'instagram', 'youtube', 'twitch', 'tiktok', 'discord',
    'github', 'linkedin', 'wechat', 'weibo', 'rednote', 'douyin', 'website'
];
const userProfileSchema = new mongoose_1.default.Schema({
    // Don't need _id field, Mongoose adds it automatically
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'auth', // Use the AuthModel's model name
        required: true,
    },
    first_name: { type: String, default: '' },
    last_name: { type: String, default: '' },
    images: { type: [String], default: [] },
    primary_profile_image: { type: String, default: null },
    country: { type: String, default: '' },
    languages: { type: [Object], default: [{ name: "" }] },
    faction: { type: String, enum: ['Autobot', 'Decepticon', ''], default: '' },
    species: { type: String, enum: ['Cybertronian', 'Terran', 'Other'], default: 'Other' },
    bio: { type: String, default: '' },
    social_links: {
        type: [
            {
                key: { type: String, enum: exports.SOCIAL_KEYS },
                value: { type: String }
            }
        ], default: []
    }
}, { timestamps: true, collection: 'user_profiles' }); // Automatically manage createdAt and updatedAt fields
exports.UserProfileModel = mongoose_1.default.model('user_profiles', userProfileSchema);
// This type will be used to return user profile data in places, such as the updateUserProfile controller.
