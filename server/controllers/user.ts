import { Request, Response } from "express";
import { AuthModel } from "../db_models/auth";
import { handleError } from "../utils/handleError";
import { UserProfileModel } from "../db_models/user_profile";
import { comparePassword, encryptPassword } from "../utils/encryptPassword";
import generateToken from "../utils/generateToken";

export const registerUser = async (req: Request, res: Response) => {
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