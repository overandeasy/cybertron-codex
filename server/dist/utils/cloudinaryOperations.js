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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = uploadImage;
exports.removeImages = removeImages;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
function uploadImage(file, user, res, asset_folder) {
    return __awaiter(this, void 0, void 0, function* () {
        // Configuration
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        try {
            // Upload an image
            const uploadResult = yield cloudinary_1.v2.uploader
                .upload(file.path, {
                public_id: `${user === null || user === void 0 ? void 0 : user._id.toString()}-${Date.now()}`, // Making sure the filename is predictable: calculated based on the user ID and the timestamp at the time of upload
                asset_folder
            })
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
            return uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.secure_url;
        }
        catch (error) {
            console.error("Error uploading image:", error);
            return res.status(500).json({ error: "Failed to upload image" });
        }
        finally {
            // Remove the temporary file after upload
            removeTempFile(file.path);
        }
    });
}
const removeTempFile = (filePath) => {
    fs_1.default.unlink(filePath, (err) => {
        if (err) {
            console.error(`Error removing temporary file: ${filePath}`, err);
            throw new Error(`Failed to remove temporary file: ${filePath}`);
        }
        else {
            console.log("Temporary file removed successfully: ", filePath);
        }
    });
};
function removeImages(urls) {
    return __awaiter(this, void 0, void 0, function* () {
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
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
                    return cloudinary_1.v2.uploader.destroy(publicId);
                }
                return Promise.resolve(null); // Or handle as you see fit when publicId is not found
            });
            const results = yield Promise.all(deletePromises);
            console.log("Images deleted successfully:", results);
            return results;
        }
        catch (error) {
            console.error("Error deleting images:", error);
            throw new Error("Failed to delete images");
        }
    });
}
