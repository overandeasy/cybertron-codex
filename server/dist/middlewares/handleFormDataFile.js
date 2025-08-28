"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMulterError = exports.handleFormDataFile = exports.handleMultipleFormDataFilesWithFields = exports.handleMultipleFormDataFiles = exports.handleSingleFormDataFile = void 0;
const multer_1 = __importDefault(require("multer"));
// Multer handles files from form-data, and stores them in a temporary location before they are uploaded to Cloudinary. Multer does not handle the actual upload to Cloudinary; that is done in the controller after the file is processed.
const multerConfig = {
    storage: multer_1.default.diskStorage({}),
    limits: {
        fileSize: 3 * 1024 * 1024, // 3MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            cb(new Error("Only image files are accepted."));
        }
    },
};
// Single file upload handler
const handleSingleFormDataFile = (filedName) => {
    return (0, multer_1.default)(multerConfig).single(filedName);
};
exports.handleSingleFormDataFile = handleSingleFormDataFile;
// Multiple files upload handler FOR SINGLE FIELD
// This is used when you want to upload multiple files under the same field name, e.g, 'collection_images'.
const handleMultipleFormDataFiles = (filedName, maxCount) => {
    return (0, multer_1.default)(multerConfig).array(filedName, maxCount);
};
exports.handleMultipleFormDataFiles = handleMultipleFormDataFiles;
// Multiple files upload handler FOR MULTIPLE FIELDS
// This is used when you want to upload multiple files under different field names, e.g, 'media_images' and 'toy_images'.
const handleMultipleFormDataFilesWithFields = (fields) => {
    return (0, multer_1.default)(multerConfig).fields(fields);
};
exports.handleMultipleFormDataFilesWithFields = handleMultipleFormDataFilesWithFields;
//Backward compatibility for the old file input name
exports.handleFormDataFile = (0, multer_1.default)(multerConfig).single('new_profile_image');
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        console.error("Multer Error:", err.code);
        console.error("Multer Error Message:", err.message);
        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                return res.status(413).json({ error: "File is too large. Maximum size is 3MB." });
            // More cases for other Multer errors can be added here.
        }
    }
    else if (err) {
        // This will catch the custom error from our fileFilter
        if (err.message === "Only image files are accepted.") {
            return res.status(415).json({ error: err.message });
        }
        // For other, non-Multer errors
        console.error("Unknown Error during file upload:", err);
        return res.status(500).json({ error: "An unexpected error occurred during file upload." });
    }
    next();
};
exports.handleMulterError = handleMulterError;
