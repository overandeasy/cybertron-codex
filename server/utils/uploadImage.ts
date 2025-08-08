import { v2 as cloudinary } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';

export async function uploadImage(file: Express.Multer.File, user: Express.Request['user'], res: Response, asset_folder: string) {
    // Configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        // Upload an image
        const uploadResult = await cloudinary.uploader
            .upload(
                file.path, {
                public_id: `${user?._id.toString()}-${Date.now()}`, // Making sure the filename is predictable: calculated based on the user ID and the timestamp at the time of upload
                asset_folder

            }
            )
            .catch((error) => {
                console.log(error);
            });

        console.log("Image upload result: ", uploadResult);

        // Optimize delivery by resizing and applying auto-format and auto-quality
        // const optimizeUrl = cloudinary.url('shoes', {
        //     fetch_format: 'auto',
        //     quality: 'auto'
        // });

        // console.log(optimizeUrl);

        // Transform the image: auto-crop to square aspect_ratio
        // const autoCropUrl = cloudinary.url('shoes', {
        //     crop: 'auto',
        //     gravity: 'auto',
        //     width: 500,
        //     height: 500,
        // });

        // console.log(autoCropUrl);
        // Remove the temporary file after upload

        return uploadResult?.secure_url;
    } catch (error) {
        console.error("Error uploading image:", error);
        return res.status(500).json({ error: "Failed to upload image" });
    } finally {
        // Remove the temporary file after upload
        removeTempFile(file.path);
    }
}


const removeTempFile = (filePath: Express.Multer.File['path']) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(`Error removing temporary file: ${filePath}`, err);
            throw new Error(`Failed to remove temporary file: ${filePath}`);
        } else {
            console.log("Temporary file removed successfully: ", filePath);
        }
    });
};
