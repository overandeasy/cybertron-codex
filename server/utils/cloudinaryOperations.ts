import { v2 as cloudinary } from 'cloudinary';
import { Response } from 'express';
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

export async function removeImages(urls: string[]) {
    try {
        console.log("Removing images with URLs:", urls);
        if (!urls || urls.length === 0) {
            console.log("No URLs provided for deletion.");
            return [];
        }
        const deletePromises = urls.map((url) => {
            // Extract everything after the version number
            const parts = url.split('/');
            const versionIndex = parts.findIndex(part => part.startsWith('v') && /^\d+$/.test(part.substring(1)));
            const publicIdWithExt = parts.slice(versionIndex + 1).join('/');
            const publicId = publicIdWithExt.split('.')[0];
            console.log("Public ID extracted:", publicId);

            // Extract public ID from URL
            if (publicId) {
                return cloudinary.uploader.destroy(publicId);
            }
            return Promise.resolve(null); // Or handle as you see fit when publicId is not found
        });

        const results = await Promise.all(deletePromises);
        console.log("Images deleted successfully:", results);
        return results;
    } catch (error) {
        console.error("Error deleting images:", error);
        throw new Error("Failed to delete images");
    }
}