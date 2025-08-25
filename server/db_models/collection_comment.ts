import mongoose from 'mongoose';

const collectionCommentSchema = new mongoose.Schema(
    {
        collection_item_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user_collections',
            required: true,
        },
        user_profile_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user_profiles',
            required: true,
        },
        content: { type: String, required: true },
    },
    { timestamps: true, collection: 'collection_comments' }
);

const CollectionCommentModel = mongoose.model('collection_comments', collectionCommentSchema);

export default CollectionCommentModel;
export type collectionCommentDocument = mongoose.InferSchemaType<typeof collectionCommentSchema>;
