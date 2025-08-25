import mongoose from 'mongoose';

const userFavoriteSchema = new mongoose.Schema(
    {
        user_profile_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user_profiles',
            required: true,
        },
        collection_item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user_collections',
            required: true,
        },
    },
    { timestamps: true, collection: 'user_favorites' }
);

const UserFavoriteModel = mongoose.model('user_favorites', userFavoriteSchema);

export default UserFavoriteModel;
