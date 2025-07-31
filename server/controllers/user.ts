import { Request, Response } from "express";
import { AuthModel } from "../db_models/auth";
import { handleError } from "../utils/handleError";
import { UserProfileModel } from "../db_models/user_profile";
import { comparePassword, encryptPassword } from "../utils/encryptPassword";

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
        await UserProfileModel.create({ user_id: registeredUser._id, first_name, last_name });
        res.status(201).json({ _id: registeredUser._id, email: registeredUser.email, createdAt: registeredUser.createdAt });
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
            res.status(200).json({ message: "Login successful", userProfile });
        } else {
            res.status(401).json({ error: "Invalid email or password" });
        }
    } catch (error) {
        handleError(error, res);
    }
}

export const getAllUserProfiles = async (req: Request, res: Response) => {
    try {
        console.log(AuthModel.modelName);
        const { id } = req.params;
        const profiles = await UserProfileModel.find({
            user_id: id ? id : { $exists: true }
        }).populate('user_id', "email active");
        res.status(200).json(profiles);
        console.log(profiles);
    } catch (error) {
        handleError(error, res);
    }
}
