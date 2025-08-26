import mongoose from "mongoose";

const userCollectionSchema = new mongoose.Schema(
    {
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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user_profiles', // Use the UserProfileModel's model name
            required: true,
        },

        acquisition_location: { type: String },
        alt_character_name: [{ name: { type: String } }],
        public: { type: Boolean, default: true }, // Corrected to Boolean and added default
    },
    { timestamps: true, collection: 'user_collections' } // Adds createdAt and updatedAt fields
);

const UserCollectionModel = mongoose.model('user_collections', userCollectionSchema);

export default UserCollectionModel;
export type userCollectionDocument = mongoose.InferSchemaType<typeof userCollectionSchema>;
// This type will be used to return user collection data in places, such as the updateUserCollection controller.