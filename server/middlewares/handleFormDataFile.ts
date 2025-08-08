import { NextFunction, Request, Response } from 'express';
import multer from 'multer'
import path from 'path'


declare global {
    namespace Express {
        interface Request {
            multerError?: string;
        }
    }
}
// Multer handles files from form-data, and stores them in a temporary location before they are uploaded to Cloudinary. Multer does not handle the actual upload to Cloudinary; that is done in the controller after the file is processed.
export const handleFormDataFile = multer({
    storage: multer.diskStorage(
        {
            // No need to set destination or filename. Multer will handle it automatically and eventually let cloudinary handle the file upload.
            // filename: (req, file, cb) => {
            //     const fileExtension = path.extname(file.originalname);
            //     let filename = req.user?._id.toString() + '-' + Date.now() + fileExtension;
            //     cb(null, filename);
            // }
        }
    ), fileFilter: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname);
        if (fileExtension !== ".jpg" && fileExtension !== ".jpeg" && fileExtension !== ".png") {
            console.error("Invalid file type:", fileExtension);
            req.multerError = "Only .jpg, .jpeg, and .png files are accepted.";
            cb(null, false);

        } else {

            cb(null, true);
        }

    }
})
export const handleMulterResponse = (req: Request, res: Response, next: NextFunction) => {

    if (req.multerError) {
        console.error("Multer error:", req.multerError);
        res.status(403).json({ error: req.multerError });
        return;
    }
    next();
}