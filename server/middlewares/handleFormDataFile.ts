import { NextFunction, Request, Response } from 'express';
import multer from 'multer'



// Multer handles files from form-data, and stores them in a temporary location before they are uploaded to Cloudinary. Multer does not handle the actual upload to Cloudinary; that is done in the controller after the file is processed.
const multerConfig = {
    storage: multer.diskStorage({}),
    limits: {
        fileSize: 3 * 1024 * 1024, // 3MB
    },
    fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {

            cb(new Error("Only image files are accepted."));
        }
    },
}
// Single file upload handler
export const handleSingleFormDataFile = (filedName: string) => {
    return multer(multerConfig).single(filedName);

}

// Multiple files upload handler FOR SINGLE FIELD
// This is used when you want to upload multiple files under the same field name, e.g, 'collection_images'.
export const handleMultipleFormDataFiles = (filedName: string, maxCount: number) => {
    return multer(multerConfig).array(filedName, maxCount);
}
// Multiple files upload handler FOR MULTIPLE FIELDS
// This is used when you want to upload multiple files under different field names, e.g, 'media_images' and 'toy_images'.

export const handleMultipleFormDataFilesWithFields = (fields: { name: string, maxCount: number }[]) => {
    return multer(multerConfig).fields(fields);
}

//Backward compatibility for the old file input name
export const handleFormDataFile = multer(multerConfig).single('new_profile_image');
export const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        console.error("Multer Error:", err.code);
        console.error("Multer Error Message:", err.message);
        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                return res.status(413).json({ error: "File is too large. Maximum size is 3MB." });

            // More cases for other Multer errors can be added here.
        }
    } else if (err) {
        // This will catch the custom error from our fileFilter
        if (err.message === "Only image files are accepted.") {
            return res.status(415).json({ error: err.message });
        }
        // For other, non-Multer errors
        console.error("Unknown Error during file upload:", err);
        return res.status(500).json({ error: "An unexpected error occurred during file upload." });
    }
    next();
}