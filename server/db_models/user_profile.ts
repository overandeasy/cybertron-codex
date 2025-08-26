import mongoose from 'mongoose'; // Import Mongoose
export const SOCIAL_KEYS = [
    'x', 'instagram', 'youtube', 'twitch', 'tiktok', 'discord',
    'github', 'linkedin', 'wechat', 'weibo', 'rednote', 'douyin', 'website'
];
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
        primary_profile_image: { type: String, default: null },
        country: { type: String, default: '' },
        languages: { type: [Object], default: [{ name: "" }] },
        faction: { type: String, enum: ['Autobot', 'Decepticon', ''], default: '' },
        species: { type: String, enum: ['Cybertronian', 'Terran', 'Other'], default: 'Other' },
        bio: { type: String, default: '' },
        social_links: {
            type: [
                {
                    key: { type: String, enum: SOCIAL_KEYS },
                    value: { type: String }
                }
            ], default: []
        }
    }, { timestamps: true, collection: 'user_profiles' }) // Automatically manage createdAt and updatedAt fields

export const UserProfileModel = mongoose.model('user_profiles', userProfileSchema);

export type userProfileDocument = mongoose.InferSchemaType<typeof userProfileSchema>;
// This type will be used to return user profile data in places, such as the updateUserProfile controller.
