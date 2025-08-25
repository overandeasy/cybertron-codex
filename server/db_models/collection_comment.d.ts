import mongoose from 'mongoose';

declare const CollectionCommentModel: mongoose.Model<any, {}, {}, {}, any>;
export default CollectionCommentModel;
export type collectionCommentDocument = mongoose.InferSchemaType<any>;
