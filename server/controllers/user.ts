import { Request, Response } from "express";
import { AuthModel } from "../db_models/auth";
import { handleError, handleSuccess } from "../utils/handleServerApiResponse";
import { UserProfileModel } from "../db_models/user_profile";
import { comparePassword, encryptPassword } from "../utils/encryptPassword";
import generateToken from "../utils/generateToken";
import { removeImages, uploadImage } from "../utils/cloudinaryOperations";
import { ObjectId } from "mongodb";

export const signUp = async (req: Request, res: Response) => {
    try {
        console.log("Registering user with data:", req.body);
        if (!req.body) {
            return handleError(res, {
                type: 'error',
                status: 400,
                code: 'BAD_REQUEST',
                message: "Registration form cannot be empty"
            });
        }
        const { email, password, firstName, lastName } = req.body
        if (!email || !password) {
            return handleError(res, {
                type: 'error',
                status: 400,
                code: 'BAD_REQUEST',
                message: "Email and password are required"
            });
        }
        if (await AuthModel.exists({ email })) {
            return handleError(res, {
                type: 'error',
                status: 409,
                code: 'CONFLICT',
                message: "Email already exists"
            });
        }
        const registeredUser = await AuthModel.create({ email, password: await encryptPassword(password), profile_id: new ObjectId, active: true }); // The profile_id is required but will only be available after user's profile is created (in the next function), so it is an empty string for now, and will be updated afterwards.
        const registeredUserProfile = await UserProfileModel.create({ _id: new ObjectId(registeredUser.profile_id), user_id: registeredUser._id, first_name: firstName, last_name: lastName });
        // Update the AuthModel with the profile_id
        // await AuthModel.findByIdAndUpdate(registeredUser._id, { profile_id: registeredUserProfile._id }, { new: true });
        const token = generateToken(registeredUser._id.toString(), registeredUser.email);
        console.log("Registered user:", registeredUser);
        console.log("Registered user profile:", registeredUserProfile);
        console.log("Generated token:", token);
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
        if (!req.body) {
            return handleError(res, {
                type: 'error',
                status: 400,
                code: 'BAD_REQUEST',
                message: "Login form cannot be empty"
            });
        }

        const { email, password } = req.body;
        if (!email || !password) {
            return handleError(res, {
                type: 'error',
                status: 400,
                code: 'BAD_REQUEST',
                message: "Email and password are required"
            });
        }
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
            return res.status(401).json({ error: "Unauthorized access" });
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
        const activeUserProfile = await UserProfileModel.findOne({ user_id: req.user._id.toString() }).populate('user_id', "email active");

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
        console.log("Updating user profile with data:", req.body);
        if (!req.user) {
            return handleError(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: "Unauthorized access"
            });
        }

        const dataToUpdate: { [key: string]: any } = {
            $push: {}, // In case there are arrays to append (but currently not used)
            $set: {}
        };



        if (req.body.imagesToDelete) {
            const deletedImages = await removeImages(JSON.parse(req.body.imagesToDelete));
            console.log("Deleted images:", deletedImages);
        }

        // Destructure all fields from the body
        const { first_name, last_name, country, faction, species, bio } = req.body;
        let { images, languages, social_links, imagesToDelete } = req.body;

        // --- Start of Corrected Logic ---

        // 1. Parse stringified arrays from FormData
        if (typeof images === 'string') {
            try {
                images = JSON.parse(images);
            } catch (e) {
                return handleError(res, {
                    type: 'error',
                    status: 400,
                    code: 'BAD_REQUEST',
                    message: "Invalid format for images.",
                    data: e
                });
            }
        }
        // Remember to handle the file upload if it exists and add the returned new image URL to the images array
        if (req.file) {
            const imageUrl = await uploadImage(req.file, req.user, res, `cybertron_codex/user_profile_images/${req.user?._id.toString()}`) as string | undefined;
            if (imageUrl) {
                images.push(imageUrl);
            }
        }
        if (typeof languages === 'string') {
            try {
                languages = JSON.parse(languages);
            } catch (e) {
                return handleError(res, {
                    type: 'error',
                    status: 400,
                    code: 'BAD_REQUEST',
                    message: "Invalid format for languages.",
                    data: e
                });
            }
        }
        if (typeof social_links === 'string') {
            try {
                social_links = JSON.parse(social_links);
            } catch (e) {
                return handleError(res, {
                    type: 'error',
                    status: 400,
                    code: 'BAD_REQUEST',
                    message: "Invalid format for social links.",
                    data: e
                });
            }
        }
        if (typeof imagesToDelete === 'string') {
            try {
                imagesToDelete = JSON.parse(imagesToDelete);
            } catch (e) {
                return handleError(res, {
                    type: 'error',
                    status: 400,
                    code: 'BAD_REQUEST',
                    message: "Invalid format for imagesToDelete.",
                    data: e
                });
            }
        }


        // 2. Build the update object using $set for replacement
        if (first_name) dataToUpdate.$set.first_name = first_name;
        if (last_name) dataToUpdate.$set.last_name = last_name;
        if (country) dataToUpdate.$set.country = country;
        if (faction) dataToUpdate.$set.faction = faction;
        if (species) dataToUpdate.$set.species = species;
        if (bio) dataToUpdate.$set.bio = bio;

        // Use $set to REPLACE the entire array

        if (languages && Array.isArray(languages)) {
            dataToUpdate.$set.languages = languages;
        }
        if (social_links && Array.isArray(social_links)) {
            // Normalize social link keys to lowercase to match schema enum values and avoid validation errors
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

        // --- End of Corrected Logic ---

        // Clean up empty operators before sending to DB
        if (Object.keys(dataToUpdate.$set).length === 0) delete dataToUpdate.$set;
        if (Object.keys(dataToUpdate.$push).length === 0) delete dataToUpdate.$push; // Currently not used, but good to keep
        if (!dataToUpdate.$pull) delete dataToUpdate.$pull; // Also check for $pull. Currently not used, but good to keep

        if (Object.keys(dataToUpdate).length === 0) {
            // If only non-changing data was sent, we can return the existing profile
            const userProfile = await UserProfileModel.findOne({ user_id: req.user._id });
            return handleSuccess(res, {
                type: 'success',
                status: 200,
                code: 'NO_UPDATE',
                message: "No data to update",
                data: { updated: false, userProfile }
            });
        }

        console.log("Final data to update:", JSON.stringify(dataToUpdate, null, 2));
        const updatedUserProfile = await UserProfileModel.findOneAndUpdate(
            { user_id: req.user._id },
            dataToUpdate,
            { new: true }
        );
        handleSuccess(res, {
            type: 'success',
            status: 200,
            code: 'USER_PROFILE_UPDATED',
            message: "User profile updated successfully",
            data: { updated: true, userProfile: updatedUserProfile }
        });
        console.log("User profile updated successfully:", updatedUserProfile);

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
}

export const setPrimaryProfileImage = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return handleError(res, { type: 'error', status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized access' });
        }
        const { imageUrl } = req.body;
        if (!imageUrl || typeof imageUrl !== 'string') {
            return handleError(res, { type: 'error', status: 400, code: 'BAD_REQUEST', message: 'imageUrl is required' });
        }

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
