import { Request, Response } from "express";
import { AuthModel } from "../db_models/auth";
import { handleError } from "../utils/handleError";
import { UserProfileModel } from "../db_models/user_profile";
import { comparePassword, encryptPassword } from "../utils/encryptPassword";
import generateToken from "../utils/generateToken";
import { removeImages, uploadImage } from "../utils/cloudinaryOperations";

export const signUp = async (req: Request, res: Response) => {
    try {
        console.log("Registering user with data:", req.body);
        if (!req.body) {
            return res.status(400).json({ error: "Registration form cannot be empty" });
        }
        const { email, password, first_name, last_name } = req.body
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        if (await AuthModel.exists({ email })) {
            return res.status(409).json({ error: "Email already exists" });
        }
        const registeredUser = await AuthModel.create({ email, password: await encryptPassword(password), active: true });
        const registeredUserProfile = await UserProfileModel.create({ user_id: registeredUser._id, first_name, last_name });
        const token = generateToken(registeredUser._id.toString(), registeredUser.email);
        console.log("Registered user:", registeredUser);
        console.log("Registered user profile:", registeredUserProfile);
        console.log("Generated token:", token);

        res.status(201).json({ registered: true, userProfile: registeredUserProfile, token });
        console.log("User registered successfully");
        console.log("User profile created successfully");

    } catch (error) {
        handleError(error, res);
    }
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        console.log("Signing in user with data:", req.body);
        if (!req.body) {
            return res.status(400).json({ error: "Login form cannot be empty" });
        }

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const user = await AuthModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        else if (user && !user.active) {
            return res.status(403).json({ error: "User account is inactive" });
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
            res.status(200).json({ authenticated: true, userProfile, token });
        } else {
            res.status(401).json({ error: "Invalid email or password" });
        }
    } catch (error) {
        handleError(error, res);
    }
}

export const getAllUserProfiles = async (req: Request, res: Response) => {
    try {
        console.log("Requested user: ", req.user);
        console.log("Requested user ID: ", req.user?._id.toString());
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized access" });
        }
        const profiles = await UserProfileModel.find({
        }).populate('user_id', "email active");
        res.status(200).json(profiles);
        console.log(profiles);
    } catch (error) {
        handleError(error, res);
    }
}

export const getActiveUserProfile = async (req: Request, res: Response) => {
    try {
        console.log("Requested user: ", req.user);
        console.log("Requested user ID: ", req.user?._id.toString());
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized access" });
        }
        const activeUserProfile = await UserProfileModel.findOne({ user_id: req.user._id.toString() }).populate('user_id', "email active");

        if (!activeUserProfile) {
            return res.status(404).json({ error: "User profile not found" });
        }
        res.status(200).json(activeUserProfile);
        console.log("Active user profile retrieved successfully:", activeUserProfile);
    } catch (error) {
        console.error("Error in getActiveUserProfile:", error);
        handleError(error, res);

    }


}

export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        // First check if the user is authenticated
        console.log("Updating user profile with data:", req.body);
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized access" });
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
                return res.status(400).json({ error: "Invalid format for images." });
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
                return res.status(400).json({ error: "Invalid format for languages." });
            }
        }
        if (typeof social_links === 'string') {
            try {
                social_links = JSON.parse(social_links);
            } catch (e) {
                return res.status(400).json({ error: "Invalid format for social links." });
            }
        }
        if (typeof imagesToDelete === 'string') {
            try {
                imagesToDelete = JSON.parse(imagesToDelete);
            } catch (e) {
                return res.status(400).json({ error: "Invalid format for imagesToDelete." });
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
            dataToUpdate.$set.social_links = social_links;
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
            return res.status(200).json({ updated: false, userProfile, message: "No data to update" });
        }

        console.log("Final data to update:", JSON.stringify(dataToUpdate, null, 2));
        const updatedUserProfile = await UserProfileModel.findOneAndUpdate(
            { user_id: req.user._id },
            dataToUpdate,
            { new: true }
        );
        res.status(200).json({ updated: true, userProfile: updatedUserProfile });
        console.log("User profile updated successfully:", updatedUserProfile);

    } catch (error) {
        console.error("Error updating user profile:", error);
        handleError(error, res);
    }
}
