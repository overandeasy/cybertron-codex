import mongoose from 'mongoose'; // Import Mongoose
import { AuthModel } from './auth';
const userProfileSchema = new mongoose.Schema(
    {
        // Don't need _id field, Mongoose adds it automatically
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'auth', // Use the AuthModel's model name

            required: true,

        },
        first_name: { type: String, default: '' },
        last_name: { type: String, default: '' },
        images: { type: [String], default: [] },
        country: { type: String, default: '' },
        languages: { type: [String], default: [] },
        faction: { type: String, enum: ['Autobot', 'Decepticon', ''], default: '' },
        species: { type: String, enum: ['Cybertronian', 'Terran', 'Other'], default: 'Other' },
        bio: { type: String, default: '' },
        social_links: {
            type: {
                twitter: { type: String },
                instagram: { type: String },
                youtube: { type: String },
                twitch: { type: String },
                tiktok: { type: String },
                discord: { type: String },
                github: { type: String },
                linkedin: { type: String },
                website: { type: String },

            }, default: {}
        }
    }, { timestamps: true, collection: 'user_profiles' }) // Automatically manage createdAt and updatedAt fields

export const UserProfileModel = mongoose.model('user_profiles', userProfileSchema);
