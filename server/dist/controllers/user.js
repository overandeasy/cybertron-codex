"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPrimaryProfileImage = exports.updateUserProfile = exports.getActiveUserProfile = exports.getAllUserProfiles = exports.loginUser = exports.signUp = void 0;
const auth_1 = require("../db_models/auth");
const handleServerApiResponse_1 = require("../utils/handleServerApiResponse");
const user_profile_1 = require("../db_models/user_profile");
const encryptPassword_1 = require("../utils/encryptPassword");
const generateToken_1 = __importDefault(require("../utils/generateToken"));
const cloudinaryOperations_1 = require("../utils/cloudinaryOperations");
const mongodb_1 = require("mongodb");
const sagaTransaction_1 = require("../utils/sagaTransaction");
const zod_1 = require("zod");
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Registering user with data from request body");
        // Zod schema for sign up validation
        const signUpSchema = zod_1.z.object({
            email: zod_1.z.string().email({ message: "Invalid email format" }),
            password: zod_1.z.string().min(6, { message: "Password must be at least 6 characters long" }),
            firstName: zod_1.z.string().min(1, { message: "First name is required" }),
            lastName: zod_1.z.string().min(1, { message: "Last name is required" })
        });
        const parsed = signUpSchema.safeParse(req.body);
        if (!parsed.success) {
            console.warn('Validation failed for signUp:', parsed.error.format());
            return (0, handleServerApiResponse_1.handleError)(res, {
                type: 'error',
                status: 400,
                code: 'VALIDATION_ERROR',
                message: 'Invalid data input',
                data: parsed.error.format()
            });
        }
        const { email, password, firstName, lastName } = parsed.data;
        if (yield auth_1.AuthModel.exists({ email })) {
            return (0, handleServerApiResponse_1.handleError)(res, {
                type: 'error',
                status: 409,
                code: 'CONFLICT',
                message: "Email already exists"
            });
        }
        const registeredUser = yield auth_1.AuthModel.create({
            email,
            password: yield (0, encryptPassword_1.encryptPassword)(password),
            profile_id: new mongodb_1.ObjectId,
            active: true
        });
        const registeredUserProfile = yield user_profile_1.UserProfileModel.create({
            _id: new mongodb_1.ObjectId(registeredUser.profile_id),
            user_id: registeredUser._id,
            first_name: firstName,
            last_name: lastName
        });
        const token = (0, generateToken_1.default)(registeredUser._id.toString(), registeredUser.email);
        // console.log("Registered user:", registeredUser);
        // console.log("Registered user profile:", registeredUserProfile);
        // console.log("Generated token:", token);
        console.log("User registered successfully");
        console.log("User profile created successfully");
        return (0, handleServerApiResponse_1.handleSuccess)(res, {
            type: 'success',
            status: 201,
            code: 'USER_REGISTERED',
            message: "User registered successfully",
            data: { registered: true, userProfile: registeredUserProfile, token }
        });
    }
    catch (error) {
        (0, handleServerApiResponse_1.handleError)(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: "Failed to register user",
            data: error
        });
    }
});
exports.signUp = signUp;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log("Signing in user with data:", req.body);
        // Zod schema for login validation
        const loginSchema = zod_1.z.object({
            email: zod_1.z.string().email({ message: "Invalid email format" }),
            password: zod_1.z.string().min(1, { message: "Password is required" })
        });
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            console.warn('Validation failed for loginUser:', parsed.error.format());
            return (0, handleServerApiResponse_1.handleError)(res, {
                type: 'error',
                status: 400,
                code: 'VALIDATION_ERROR',
                message: 'Invalid data input',
                data: parsed.error.format()
            });
        }
        const { email, password } = parsed.data;
        const user = yield auth_1.AuthModel.findOne({ email });
        if (!user) {
            return (0, handleServerApiResponse_1.handleError)(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: "Invalid email or password"
            });
        }
        else if (user && !user.active) {
            return (0, handleServerApiResponse_1.handleError)(res, {
                type: 'error',
                status: 403,
                code: 'FORBIDDEN',
                message: "User account is inactive"
            });
        }
        else if (user && (yield (0, encryptPassword_1.comparePassword)(password, user.password))) {
            const userProfile = yield user_profile_1.UserProfileModel.findOne({ user_id: user._id }).populate('user_id', "-password");
            const populatedUser = userProfile.user_id;
            const token = (0, generateToken_1.default)(populatedUser._id.toString(), populatedUser.email);
            return (0, handleServerApiResponse_1.handleSuccess)(res, {
                type: 'success',
                status: 200,
                code: 'LOGIN_SUCCESS',
                message: "User logged in successfully",
                data: { authenticated: true, userProfile, token }
            });
        }
        else {
            return (0, handleServerApiResponse_1.handleError)(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: "Invalid email or password"
            });
        }
    }
    catch (error) {
        (0, handleServerApiResponse_1.handleError)(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: "Failed to login user",
            data: error
        });
    }
});
exports.loginUser = loginUser;
const getAllUserProfiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // console.log("Requested user: ", req.user);
        console.log("Requested user ID: ", (_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString());
        if (!req.user) {
            return (0, handleServerApiResponse_1.handleError)(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: "Unauthorized access"
            });
        }
        const profiles = yield user_profile_1.UserProfileModel.find({}).populate('user_id', "email active");
        return (0, handleServerApiResponse_1.handleSuccess)(res, {
            type: 'success',
            status: 200,
            code: 'SUCCESS',
            message: "User profiles retrieved successfully",
            data: profiles
        });
    }
    catch (error) {
        (0, handleServerApiResponse_1.handleError)(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: "Failed to retrieve user profiles",
            data: error
        });
    }
});
exports.getAllUserProfiles = getAllUserProfiles;
const getActiveUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // console.log("Requested user: ", req.user);
        console.log("Requested user ID: ", (_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString());
        if (!req.user) {
            return (0, handleServerApiResponse_1.handleError)(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: "Unauthorized access"
            });
        }
        const activeUserProfile = yield user_profile_1.UserProfileModel.findOne({ user_id: req.user._id.toString() }).populate('user_id', "email active");
        if (!activeUserProfile) {
            return (0, handleServerApiResponse_1.handleError)(res, {
                type: 'error',
                status: 404,
                code: 'NOT_FOUND',
                message: "User profile not found"
            });
        }
        return (0, handleServerApiResponse_1.handleSuccess)(res, {
            type: 'success',
            status: 200,
            code: 'SUCCESS',
            message: "Active user profile retrieved successfully",
            data: activeUserProfile
        });
    }
    catch (error) {
        console.error("Error in getActiveUserProfile:", error);
        (0, handleServerApiResponse_1.handleError)(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: "Failed to retrieve active user profile",
            data: error
        });
    }
});
exports.getActiveUserProfile = getActiveUserProfile;
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // First check if the user is authenticated
        console.log("Updating user profile with data from request body");
        if (!req.user) {
            return (0, handleServerApiResponse_1.handleError)(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: "Unauthorized access"
            });
        }
        // Get the current user profile for rollback purposes
        const currentUserProfile = yield user_profile_1.UserProfileModel.findOne({ user_id: req.user._id });
        if (!currentUserProfile) {
            return (0, handleServerApiResponse_1.handleError)(res, {
                type: 'error',
                status: 404,
                code: 'NOT_FOUND',
                message: "User profile not found"
            });
        }
        const dataToUpdate = {
            $push: {}, // In case there are arrays to append (but currently not used)
            $set: {}
        };
        // Validate and parse incoming data using Zod
        const profileUpdateSchema = zod_1.z.object({
            first_name: zod_1.z.string().min(1).optional(),
            last_name: zod_1.z.string().min(1).optional(),
            country: zod_1.z.string().optional(),
            faction: zod_1.z.enum(["Autobot", "Decepticon", ""]).optional(),
            species: zod_1.z.enum(["Cybertronian", "Terran", "Other"]).optional(),
            bio: zod_1.z.string().optional(),
            images: zod_1.z.preprocess((val) => {
                if (!val)
                    return undefined;
                if (typeof val === 'string') {
                    try {
                        return JSON.parse(val);
                    }
                    catch (_a) {
                        return undefined;
                    }
                }
                return val;
            }, zod_1.z.array(zod_1.z.string()).optional()),
            languages: zod_1.z.preprocess((val) => {
                if (!val)
                    return undefined;
                if (typeof val === 'string') {
                    try {
                        return JSON.parse(val);
                    }
                    catch (_a) {
                        return undefined;
                    }
                }
                return val;
            }, zod_1.z.array(zod_1.z.object({
                name: zod_1.z.string()
            })).optional()),
            social_links: zod_1.z.preprocess((val) => {
                if (!val)
                    return undefined;
                if (typeof val === 'string') {
                    try {
                        return JSON.parse(val);
                    }
                    catch (_a) {
                        return undefined;
                    }
                }
                return val;
            }, zod_1.z.array(zod_1.z.object({
                key: zod_1.z.enum(user_profile_1.SOCIAL_KEYS),
                value: zod_1.z.string()
            })).optional()),
            imagesToDelete: zod_1.z.preprocess((val) => {
                if (!val)
                    return undefined;
                if (typeof val === 'string') {
                    try {
                        return JSON.parse(val);
                    }
                    catch (_a) {
                        return undefined;
                    }
                }
                return val;
            }, zod_1.z.array(zod_1.z.string()).optional())
        });
        const parsed = profileUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
            console.warn('Validation failed for updateUserProfile:', parsed.error.format());
            return (0, handleServerApiResponse_1.handleError)(res, {
                type: 'error',
                status: 400,
                code: 'VALIDATION_ERROR',
                message: 'Invalid data input',
                data: parsed.error.format()
            });
        }
        // Use the validated data from parsed.data
        let { images, languages, social_links, imagesToDelete } = parsed.data;
        const { first_name, last_name, country, faction, species, bio } = parsed.data;
        // Initialize Saga Transaction
        const saga = new sagaTransaction_1.EnhancedSagaTransaction(true);
        const newUploadedImageUrl = [];
        const deletedImageUrls = [];
        let updatedProfile = null;
        // Step 1: Delete old images from Cloudinary if requested
        if (imagesToDelete && Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
            saga.addStep({
                name: 'delete_old_profile_images',
                execute: () => __awaiter(void 0, void 0, void 0, function* () {
                    console.log(`Deleting ${imagesToDelete.length} profile images from Cloudinary`);
                    yield (0, cloudinaryOperations_1.removeImages)(imagesToDelete);
                    deletedImageUrls.push(...imagesToDelete);
                    // Remove deleted images from the images array
                    if (Array.isArray(images)) {
                        images = images.filter((img) => !imagesToDelete.includes(img));
                    }
                    return imagesToDelete;
                }),
                compensate: () => __awaiter(void 0, void 0, void 0, function* () {
                    // Note: Cannot restore deleted Cloudinary images
                    console.log('[Saga] Cannot restore deleted Cloudinary images');
                }),
                retries: 2
            });
        }
        // Step 2: Upload new profile image if provided
        if (req.file) {
            saga.addStep(sagaTransaction_1.EnhancedSagaTransaction.createCloudinaryUploadStep('upload_new_profile_image', () => __awaiter(void 0, void 0, void 0, function* () {
                const imageUrl = yield (0, cloudinaryOperations_1.uploadImage)(req.file, req.user, res, `cybertron_codex/user_profile_images/${req.user._id.toString()}`);
                if (imageUrl && typeof imageUrl === 'string') {
                    if (!Array.isArray(images))
                        images = [];
                    images.push(imageUrl);
                    console.log(`Successfully uploaded new profile image: ${imageUrl}`);
                    return [imageUrl];
                }
                return [];
            }), newUploadedImageUrl));
        }
        // Step 3: Update the user profile document
        saga.addStep(sagaTransaction_1.EnhancedSagaTransaction.createMongoStep('update_profile_document', () => __awaiter(void 0, void 0, void 0, function* () {
            // Build the update object using $set for replacement
            if (first_name)
                dataToUpdate.$set.first_name = first_name;
            if (last_name)
                dataToUpdate.$set.last_name = last_name;
            if (country)
                dataToUpdate.$set.country = country;
            if (faction)
                dataToUpdate.$set.faction = faction;
            if (species)
                dataToUpdate.$set.species = species;
            if (bio)
                dataToUpdate.$set.bio = bio;
            if (languages && Array.isArray(languages)) {
                dataToUpdate.$set.languages = languages;
            }
            if (social_links && Array.isArray(social_links)) {
                // Normalize social link keys to lowercase to match schema enum values
                try {
                    const normalized = social_links.map((s) => ({
                        key: String((s && s.key) || '').toLowerCase(),
                        value: s && s.value
                    }));
                    dataToUpdate.$set.social_links = normalized;
                }
                catch (e) {
                    // Fallback: set as-is if mapping fails
                    dataToUpdate.$set.social_links = social_links;
                }
            }
            if (images && Array.isArray(images)) {
                dataToUpdate.$set.images = images;
            }
            // Clean up empty operators before sending to DB
            if (Object.keys(dataToUpdate.$set).length === 0)
                delete dataToUpdate.$set;
            if (Object.keys(dataToUpdate.$push).length === 0)
                delete dataToUpdate.$push;
            if (!dataToUpdate.$pull)
                delete dataToUpdate.$pull;
            if (Object.keys(dataToUpdate).length === 0) {
                // No data to update, return current profile
                return currentUserProfile;
            }
            // console.log("Final data to update:", JSON.stringify(dataToUpdate, null, 2));
            updatedProfile = yield user_profile_1.UserProfileModel.findOneAndUpdate({ user_id: req.user._id }, dataToUpdate, { new: true });
            if (!updatedProfile) {
                throw new Error("Failed to update user profile");
            }
            console.log("User profile updated successfully");
            return updatedProfile;
        }), () => __awaiter(void 0, void 0, void 0, function* () {
            // Compensating action: Restore original profile data
            if (currentUserProfile) {
                console.log(`[Saga] Restoring original user profile data for user: ${req.user._id}`);
                const _a = currentUserProfile.toObject(), { _id, createdAt, updatedAt } = _a, originalData = __rest(_a, ["_id", "createdAt", "updatedAt"]);
                yield user_profile_1.UserProfileModel.findOneAndUpdate({ user_id: req.user._id }, { $set: originalData }, { new: true });
            }
        })));
        // Execute the saga
        const result = yield saga.execute();
        return (0, handleServerApiResponse_1.handleSuccess)(res, {
            type: 'success',
            status: 200,
            code: 'USER_PROFILE_UPDATED',
            message: "User profile updated successfully",
            data: { updated: true, userProfile: result }
        });
    }
    catch (error) {
        console.error("Error updating user profile:", error);
        (0, handleServerApiResponse_1.handleError)(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: "Failed to update user profile",
            data: error
        });
    }
});
exports.updateUserProfile = updateUserProfile;
const setPrimaryProfileImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return (0, handleServerApiResponse_1.handleError)(res, { type: 'error', status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized access' });
        }
        // Zod schema for primary image validation
        const primaryImageSchema = zod_1.z.object({
            imageUrl: zod_1.z.string().url({ message: "Valid image URL is required" })
        });
        const parsed = primaryImageSchema.safeParse(req.body);
        if (!parsed.success) {
            console.warn('Validation failed for setPrimaryProfileImage:', parsed.error.format());
            return (0, handleServerApiResponse_1.handleError)(res, {
                type: 'error',
                status: 400,
                code: 'VALIDATION_ERROR',
                message: 'Invalid data input',
                data: parsed.error.format()
            });
        }
        const { imageUrl } = parsed.data;
        // Verify the image belongs to the user's profile images
        const userProfile = yield user_profile_1.UserProfileModel.findOne({ user_id: req.user._id });
        if (!userProfile) {
            return (0, handleServerApiResponse_1.handleError)(res, { type: 'error', status: 404, code: 'NOT_FOUND', message: 'User profile not found' });
        }
        const images = (userProfile.images || []).map(String);
        if (!images.includes(imageUrl)) {
            return (0, handleServerApiResponse_1.handleError)(res, { type: 'error', status: 400, code: 'INVALID_IMAGE', message: 'Provided image does not belong to the user' });
        }
        // Use an atomic update to avoid triggering full-document validation (some legacy fields may fail validation on save)
        const updatedProfile = yield user_profile_1.UserProfileModel.findOneAndUpdate({ user_id: req.user._id }, { $set: { primary_profile_image: imageUrl } }, { new: true });
        return (0, handleServerApiResponse_1.handleSuccess)(res, { type: 'success', status: 200, code: 'PRIMARY_IMAGE_SET', message: 'Primary profile image updated', data: updatedProfile });
    }
    catch (error) {
        console.error('Error setting primary profile image:', error);
        return (0, handleServerApiResponse_1.handleError)(res, { type: 'error', status: 500, code: 'INTERNAL_SERVER_ERROR', message: 'Failed to set primary profile image', data: error });
    }
});
exports.setPrimaryProfileImage = setPrimaryProfileImage;
