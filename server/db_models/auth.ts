
import mongoose from "mongoose";

const authSchema = new mongoose.Schema({
    // Don't need _id field, Mongoose adds it automatically

    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true }
}, { timestamps: true, collection: "auth" }) // Automatically manage createdAt and updatedAt fields

export const AuthModel = mongoose.model("auth", authSchema);




// To-do: to include optional fields for OAuth and hybrid accounts.
// const authSchema = new mongoose.Schema({
//     _id: { type: ObjectId, auto: true, unique: true, required: true },
//     username: { type: String, required: true, unique: true },
//     password: {
//         type: String,
//         required: function () {
//             // Password required only for local authentication
//             return this.account_type === 'local' || this.account_type === 'hybrid';
//         }
//     },
//     email: { type: String, required: true, unique: true },
//     email_verified: { type: Boolean, default: false },
//     active: { type: Boolean, default: true },

//     account_type: {
//         type: String,
//         enum: ['local', 'oauth', 'hybrid'],
//         required: true,
//         default: 'local'
//     },

//     // OAuth provider information
//     oauth_providers: [{
//         provider: {
//             type: String,
//             enum: ['google', 'github', 'facebook', 'twitter', 'discord']
//         },
//         provider_id: { type: String, required: true },
//         provider_email: { type: String },
//         connected_at: { type: Date, default: Date.now }
//     }]
// }, { timestamps: true })


// Optional: add validation in authentication logic
// authSchema.pre('save', function (next) {
//     // Ensure OAuth users have at least one provider
//     if (this.account_type === 'oauth' && this.oauth_providers.length === 0) {
//         return next(new Error('OAuth users must have at least one provider'));
//     }

//     // Ensure local users have a password
//     if ((this.account_type === 'local' || this.account_type === 'hybrid') && !this.password) {
//         return next(new Error('Local authentication requires a password'));
//     }

//     next();
// });