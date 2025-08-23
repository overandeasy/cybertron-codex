
import mongoose from "mongoose";

const authSchema = new mongoose.Schema({
    // Don't need _id field, Mongoose adds it automatically

    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true },
    profile_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user_profiles', // Use the UserProfileModel's model name
        required: true,
    }
}, { timestamps: true, collection: "auth" }) // Automatically manage createdAt and updatedAt fields

export const AuthModel = mongoose.model("auth", authSchema);
export type AuthDocument = mongoose.InferSchemaType<typeof authSchema>;
export type AuthUser = Omit<AuthDocument, "password"> & { _id: mongoose.Types.ObjectId }; // This type will be used to return user data without the password field in the validateToken middleware and other places where we don't want to expose the password field.
