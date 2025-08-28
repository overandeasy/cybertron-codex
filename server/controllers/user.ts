import { Request, Response } from "express";
import { AuthModel } from "../db_models/auth";
import { handleError, handleSuccess } from "../utils/handleServerApiResponse";
import { UserProfileModel, SOCIAL_KEYS } from "../db_models/user_profile";
import { comparePassword, encryptPassword } from "../utils/encryptPassword";
import generateToken from "../utils/generateToken";
import { removeImages, uploadImage } from "../utils/cloudinaryOperations";
import { ObjectId } from "mongodb";
import { EnhancedSagaTransaction } from "../utils/sagaTransaction";
import { z } from "zod";

export const signUp = async (req: Request, res: Response) => {
    try {
        console.log("Registering user with data from request body");

        // Zod schema for sign up validation
        const signUpSchema = z.object({
            email: z.string().email({ message: "Invalid email format" }),
            password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
            firstName: z.string().min(1, { message: "First name is required" }),
            lastName: z.string().min(1, { message: "Last name is required" })
        });

        const parsed = signUpSchema.safeParse(req.body);
        if (!parsed.success) {
            console.warn('Validation failed for signUp:', parsed.error.format());
            return handleError(res, {
                type: 'error',
                status: 400,
                code: 'VALIDATION_ERROR',
                message: 'Invalid data input',
                data: parsed.error.format()
            });
        }

        const { email, password, firstName, lastName } = parsed.data;

        if (await AuthModel.exists({ email })) {
            return handleError(res, {
                type: 'error',
                status: 409,
                code: 'CONFLICT',
                message: "Email already exists"
            });
        }

        const registeredUser = await AuthModel.create({
            email,
            password: await encryptPassword(password),
            profile_id: new ObjectId,
            active: true
        });

        const registeredUserProfile = await UserProfileModel.create({
            _id: new ObjectId(registeredUser.profile_id),
            user_id: registeredUser._id,
            first_name: firstName,
            last_name: lastName
        });

        const token = generateToken(registeredUser._id.toString(), registeredUser.email);
        // console.log("Registered user:", registeredUser);
        // console.log("Registered user profile:", registeredUserProfile);
        // console.log("Generated token:", token);
        console.log("User registered successfully");
        console.log("User profile created successfully");

        return handleSuccess(res, {
            type: 'success',
            status: 201,
            code: 'USER_REGISTERED',
            message: "User registered successfully",
            data: { registered: true, userProfile: registeredUserProfile, token }
        });


    } catch (error) {
        handleError(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: "Failed to register user",
            data: error
        });
    }
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        // console.log("Signing in user with data:", req.body);

        // Zod schema for login validation
        const loginSchema = z.object({
            email: z.string().email({ message: "Invalid email format" }),
            password: z.string().min(1, { message: "Password is required" })
        });

        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            console.warn('Validation failed for loginUser:', parsed.error.format());
            return handleError(res, {
                type: 'error',
                status: 400,
                code: 'VALIDATION_ERROR',
                message: 'Invalid data input',
                data: parsed.error.format()
            });
        }

        const { email, password } = parsed.data;

        const user = await AuthModel.findOne({ email });
        if (!user) {
            return handleError(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: "Invalid email or password"
            });
        }
        else if (user && !user.active) {
            return handleError(res, {
                type: 'error',
                status: 403,
                code: 'FORBIDDEN',
                message: "User account is inactive"
            });
        }
        else if (user && await comparePassword(password, user.password)) {
            const userProfile = await UserProfileModel.findOne({ user_id: user._id }).populate('user_id', "-password");
            // Passwords match, proceed with login
            interface PopulatedUserIdObject {
                _id: string;
                email: string;
                active?: boolean;
                createdAt?: Date;
                updatedAt?: Date;
            }
            const populatedUser = userProfile!.user_id as unknown as PopulatedUserIdObject;

            const token = generateToken(populatedUser._id.toString(), populatedUser.email);
            return handleSuccess(res, {
                type: 'success',
                status: 200,
                code: 'LOGIN_SUCCESS',
                message: "User logged in successfully",
                data: { authenticated: true, userProfile, token }
            });
        } else {
            return handleError(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: "Invalid email or password"
            });
        }
    } catch (error) {
        handleError(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: "Failed to login user",
            data: error
        });
    }
}

export const getAllUserProfiles = async (req: Request, res: Response) => {
    try {
        // console.log("Requested user: ", req.user);
        console.log("Requested user ID: ", req.user?._id.toString());
        if (!req.user) {
            return handleError(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: "Unauthorized access"
            });
        }
        const profiles = await UserProfileModel.find({
        }).populate('user_id', "email active");
        return handleSuccess(res, {
            type: 'success',
            status: 200,
            code: 'SUCCESS',
            message: "User profiles retrieved successfully",
            data: profiles
        });
    } catch (error) {
        handleError(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: "Failed to retrieve user profiles",
            data: error
        });
    }
}

export const getActiveUserProfile = async (req: Request, res: Response) => {
    try {
        // console.log("Requested user: ", req.user);
        console.log("Requested user ID: ", req.user?._id.toString());
        if (!req.user) {
            return handleError(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: "Unauthorized access"
            });
        }
        const queryStart = Date.now();
        const activeUserProfile = await UserProfileModel.findOne({ user_id: req.user._id.toString() }).populate('user_id', "email active");
        console.log(`[getActiveUserProfile] DB query took ${Date.now() - queryStart}ms`);

        try {
            const size = JSON.stringify(activeUserProfile).length;
            console.log(`[getActiveUserProfile] payload size ${size} bytes`);
        } catch (e) {
            // ignore
        }

        if (!activeUserProfile) {
            return handleError(res, {
                type: 'error',
                status: 404,
                code: 'NOT_FOUND',
                message: "User profile not found"
            });
        }
        return handleSuccess(res, {
            type: 'success',
            status: 200,
            code: 'SUCCESS',
            message: "Active user profile retrieved successfully",
            data: activeUserProfile
        });
    } catch (error) {
        console.error("Error in getActiveUserProfile:", error);
        handleError(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: "Failed to retrieve active user profile",
            data: error
        });

    }


}

export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        // First check if the user is authenticated
        console.log("Updating user profile with data from request body");
        if (!req.user) {
            return handleError(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: "Unauthorized access"
            });
        }

        // Get the current user profile for rollback purposes
        const currentUserProfile = await UserProfileModel.findOne({ user_id: req.user._id });
        if (!currentUserProfile) {
            return handleError(res, {
                type: 'error',
                status: 404,
                code: 'NOT_FOUND',
                message: "User profile not found"
            });
        }

        const dataToUpdate: { [key: string]: any } = {
            $push: {}, // In case there are arrays to append (but currently not used)
            $set: {}
        };

        // Validate and parse incoming data using Zod
        const profileUpdateSchema = z.object({
            first_name: z.string().min(1).optional(),
            last_name: z.string().min(1).optional(),
            country: z.string().optional(),
            faction: z.enum(["Autobot", "Decepticon", ""]).optional(),
            species: z.enum(["Cybertronian", "Terran", "Other"]).optional(),
            bio: z.string().optional(),
            images: z.preprocess((val: any) => {
                if (!val) return undefined;
                if (typeof val === 'string') {
                    try { return JSON.parse(val); } catch { return undefined; }
                }
                return val;
            }, z.array(z.string()).optional()),
            languages: z.preprocess((val: any) => {
                if (!val) return undefined;
                if (typeof val === 'string') {
                    try { return JSON.parse(val); } catch { return undefined; }
                }
                return val;
            }, z.array(z.object({
                name: z.string()
            })).optional()),
            social_links: z.preprocess((val: any) => {
                if (!val) return undefined;
                if (typeof val === 'string') {
                    try { return JSON.parse(val); } catch { return undefined; }
                }
                return val;
            }, z.array(z.object({
                key: z.enum(SOCIAL_KEYS as [string, ...string[]]),
                value: z.string()
            })).optional()),
            imagesToDelete: z.preprocess((val: any) => {
                if (!val) return undefined;
                if (typeof val === 'string') {
                    try { return JSON.parse(val); } catch { return undefined; }
                }
                return val;
            }, z.array(z.string()).optional())
        });

        const parsed = profileUpdateSchema.safeParse(req.body);
        if (!parsed.success) {
            console.warn('Validation failed for updateUserProfile:', parsed.error.format());
            return handleError(res, {
                type: 'error',
                status: 400,
                code: 'VALIDATION_ERROR',
                message: 'Invalid data input',
                data: parsed.error.format()
            });
        }

        // Use the validated data from parsed.data
        let {
            images,
            languages,
            social_links,
            imagesToDelete
        } = parsed.data;

        const {
            first_name,
            last_name,
            country,
            faction,
            species,
            bio
        } = parsed.data;

        // Initialize Saga Transaction
        const saga = new EnhancedSagaTransaction(true);
        const newUploadedImageUrl: string[] = [];
        const deletedImageUrls: string[] = [];
        let updatedProfile: any = null;

        // Step 1: Delete old images from Cloudinary if requested
        if (imagesToDelete && Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
            saga.addStep({
                name: 'delete_old_profile_images',
                execute: async () => {
                    console.log(`Deleting ${imagesToDelete.length} profile images from Cloudinary`);
                    await removeImages(imagesToDelete);
                    deletedImageUrls.push(...imagesToDelete);

                    // Remove deleted images from the images array
                    if (Array.isArray(images)) {
                        images = images.filter((img: string) => !imagesToDelete.includes(img));
                    }

                    return imagesToDelete;
                },
                compensate: async () => {
                    // Note: Cannot restore deleted Cloudinary images
                    console.log('[Saga] Cannot restore deleted Cloudinary images');
                },
                retries: 2
            });
        }

        // Step 2: Upload new profile image if provided
        if (req.file) {
            saga.addStep(EnhancedSagaTransaction.createCloudinaryUploadStep(
                'upload_new_profile_image',
                async () => {
                    const imageUrl = await uploadImage(
                        req.file!,
                        req.user!,
                        res,
                        `cybertron_codex/user_profile_images/${req.user!._id.toString()}`
                    ) as string;
                    if (imageUrl && typeof imageUrl === 'string') {
                        if (!Array.isArray(images)) images = [];
                        images.push(imageUrl);
                        console.log(`Successfully uploaded new profile image: ${imageUrl}`);
                        return [imageUrl];
                    }
                    return [];
                },
                newUploadedImageUrl
            ));
        }

        // Step 3: Update the user profile document
        saga.addStep(EnhancedSagaTransaction.createMongoStep(
            'update_profile_document',
            async () => {
                // Build the update object using $set for replacement
                if (first_name) dataToUpdate.$set.first_name = first_name;
                if (last_name) dataToUpdate.$set.last_name = last_name;
                if (country) dataToUpdate.$set.country = country;
                if (faction) dataToUpdate.$set.faction = faction;
                if (species) dataToUpdate.$set.species = species;
                if (bio) dataToUpdate.$set.bio = bio;

                if (languages && Array.isArray(languages)) {
                    dataToUpdate.$set.languages = languages;
                }

                if (social_links && Array.isArray(social_links)) {
                    // Normalize social link keys to lowercase to match schema enum values
                    try {
                        const normalized = social_links.map((s: any) => ({
                            key: String((s && s.key) || '').toLowerCase(),
                            value: s && s.value
                        }));
                        dataToUpdate.$set.social_links = normalized;
                    } catch (e) {
                        // Fallback: set as-is if mapping fails
                        dataToUpdate.$set.social_links = social_links;
                    }
                }

                if (images && Array.isArray(images)) {
                    dataToUpdate.$set.images = images;
                }

                // Clean up empty operators before sending to DB
                if (Object.keys(dataToUpdate.$set).length === 0) delete dataToUpdate.$set;
                if (Object.keys(dataToUpdate.$push).length === 0) delete dataToUpdate.$push;
                if (!dataToUpdate.$pull) delete dataToUpdate.$pull;

                if (Object.keys(dataToUpdate).length === 0) {
                    // No data to update, return current profile
                    return currentUserProfile;
                }

                // console.log("Final data to update:", JSON.stringify(dataToUpdate, null, 2));
                updatedProfile = await UserProfileModel.findOneAndUpdate(
                    { user_id: req.user!._id },
                    dataToUpdate,
                    { new: true }
                );

                if (!updatedProfile) {
                    throw new Error("Failed to update user profile");
                }

                console.log("User profile updated successfully");
                return updatedProfile;
            },
            async () => {
                // Compensating action: Restore original profile data
                if (currentUserProfile) {
                    console.log(`[Saga] Restoring original user profile data for user: ${req.user!._id}`);
                    const { _id, createdAt, updatedAt, ...originalData } = currentUserProfile.toObject();
                    await UserProfileModel.findOneAndUpdate(
                        { user_id: req.user!._id },
                        { $set: originalData },
                        { new: true }
                    );
                }
            }
        ));

        // Execute the saga
        const result = await saga.execute();

        return handleSuccess(res, {
            type: 'success',
            status: 200,
            code: 'USER_PROFILE_UPDATED',
            message: "User profile updated successfully",
            data: { updated: true, userProfile: result }
        });

    } catch (error) {
        console.error("Error updating user profile:", error);
        handleError(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: "Failed to update user profile",
            data: error
        });
    }
};

export const setPrimaryProfileImage = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return handleError(res, { type: 'error', status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized access' });
        }

        // Zod schema for primary image validation
        const primaryImageSchema = z.object({
            imageUrl: z.string().url({ message: "Valid image URL is required" })
        });

        const parsed = primaryImageSchema.safeParse(req.body);
        if (!parsed.success) {
            console.warn('Validation failed for setPrimaryProfileImage:', parsed.error.format());
            return handleError(res, {
                type: 'error',
                status: 400,
                code: 'VALIDATION_ERROR',
                message: 'Invalid data input',
                data: parsed.error.format()
            });
        }

        const { imageUrl } = parsed.data;

        // Verify the image belongs to the user's profile images
        const userProfile = await UserProfileModel.findOne({ user_id: req.user._id });
        if (!userProfile) {
            return handleError(res, { type: 'error', status: 404, code: 'NOT_FOUND', message: 'User profile not found' });
        }

        const images: string[] = (userProfile.images || []).map(String);
        if (!images.includes(imageUrl)) {
            return handleError(res, { type: 'error', status: 400, code: 'INVALID_IMAGE', message: 'Provided image does not belong to the user' });
        }

        // Use an atomic update to avoid triggering full-document validation (some legacy fields may fail validation on save)
        const updatedProfile = await UserProfileModel.findOneAndUpdate(
            { user_id: req.user._id },
            { $set: { primary_profile_image: imageUrl } },
            { new: true }
        );

        return handleSuccess(res, { type: 'success', status: 200, code: 'PRIMARY_IMAGE_SET', message: 'Primary profile image updated', data: updatedProfile });
    } catch (error) {
        console.error('Error setting primary profile image:', error);
        return handleError(res, { type: 'error', status: 500, code: 'INTERNAL_SERVER_ERROR', message: 'Failed to set primary profile image', data: error });
    }
}
