import { Request, Response } from "express";
import UserCollectionModel, { userCollectionDocument } from "../db_models/user_collection";
import { handleError, handleSuccess } from "../utils/handleServerApiResponse";
import { uploadImage } from "../utils/cloudinaryOperations";
import { removeImages } from "../utils/cloudinaryOperations";
import CollectionCommentModel from "../db_models/collection_comment";
import UserFavoriteModel from "../db_models/user_favorite";
import { z } from "zod";
import { EnhancedSagaTransaction } from "../utils/sagaTransaction";

// Allowed currency codes for validation
const ALLOWED_CURRENCIES = [
    'USD', 'EUR', 'CNY', 'GBP', 'AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP', 'COP', 'CRC', 'CUC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'FJD', 'FKP', 'FOK', 'GEL', 'GGP', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'IMP', 'INR', 'IQD', 'IRR', 'ISK', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KID', 'KMF', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLL', 'SOS', 'SRD', 'SSP', 'STN', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TVD', 'TWD', 'TZS', 'UAH', 'UGX', 'UYU', 'UZS', 'VES', 'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XOF', 'XPF', 'YER', 'ZAR', 'ZMW', 'ZWL'
];

// This function is not being used. 
// export const getAllCollections = async (req: Request, res: Response) => {
//     try {
//         console.log("Requested user: ", req.user);
//         console.log("Requested user ID: ", req.user?._id.toString());
//         if (!req.user) {
//             return res.status(401).json({ error: "Unauthorized access" });
//         }
//         const profiles = await UserCollectionModel.find({

//         }).populate('user_profile_id', "first_name last_name");
//         res.status(200).json(profiles);
//         console.log(profiles);
//     } catch (error) {
//         handleError(error, res);
//     }
// };


export const getAllPublicCollections = async (req: Request, res: Response) => {
    try {

        console.log("Requested user ID: ", req.user?._id?.toString());
        if (!req.user) {
            return handleError(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: "Unauthorized access",

            });
        }
        const publicCollections = await UserCollectionModel.find({
            public: true
        }).populate<{ user_profile_id: { user_id: string; first_name: string; last_name: string; } }>('user_profile_id', "user_id first_name last_name").sort({ createdAt: -1 });

        handleSuccess(res, {
            type: 'success',
            status: 200,
            code: 'SUCCESS',
            message: "Public collections retrieved successfully",
            data: publicCollections
        });
    } catch (error) {

        handleError(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: "An error occurred while retrieving public collections",
            data: error
            // The error won't be exposed to http response, but only logged to the server console

        });
    }
};

export const getMyCollection = async (req: Request, res: Response) => {
    try {

        console.log("Requested user ID: ", req.user?._id?.toString());
        console.log("Requested user profile ID: ", req.user?.profile_id);
        if (!req.user) {
            return handleError(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: "Unauthorized access"
            });
        }
        const myCollection = await UserCollectionModel.find({
            user_profile_id: req.user.profile_id,
        }).populate('user_profile_id', "user_id first_name last_name").sort({ createdAt: -1 });
        handleSuccess(res, {
            type: 'success',
            status: 200,
            code: 'SUCCESS',
            message: "User's collection retrieved successfully",
            data: myCollection
        });

    } catch (error) {
        handleError(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: "An error occurred while retrieving user's collection",
            data: error
            // The error won't be exposed to http response, but only logged to the server console
        });
    }
};

export const getCollectionItemById = async (req: Request, res: Response) => {
    try {
        const collectionId: string = req.params.collectionId;
        console.log("Requested collection ID: ", collectionId);
        console.log("Requested user ID: ", req.user?._id?.toString());
        console.log("Requested user profile ID: ", req.user?.profile_id);
        if (!req.user) {
            return handleError(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: "Unauthorized access"
            });
        }
        const collectionItem = await UserCollectionModel.findById(collectionId).populate('user_profile_id', "user_id first_name last_name");
        if (!collectionItem) {
            return handleError(res, {
                type: 'error',
                status: 404,
                code: 'NOT_FOUND',
                message: "Collection item not found"
            });
        }
        handleSuccess(res, {
            type: 'success',
            status: 200,
            code: 'SUCCESS',
            message: "Collection item retrieved successfully",
            data: collectionItem
        });
        console.log("Collection item retrieved successfully");
    } catch (error) {
        handleError(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: "An error occurred while retrieving collection item",
            data: error
        });
    }
};


export const addUserCollection = async (req: Request, res: Response) => {
    try {
        console.log("Adding user collection with data from request body");
        console.log("Files received:", req.files?.length);

        if (!req.user || !req.user._id) {
            return handleError(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: "Unauthorized access"
            });
        }

        const userId = req.user._id?.toString();

        // Validate and parse incoming data using Zod
        const collectionSchema = z.object({
            character_name: z.string().min(1, { message: 'character_name is required' }),
            character_primary_faction: z.enum(["Autobot", "Decepticon"]),
            character_description: z.string().optional().nullable().default(""),
            toy_line: z.string().optional().nullable().default(""),
            toy_class: z.string().optional().nullable().default(""),
            collection_notes: z.string().optional().nullable().default(""),
            acquisition_date: z.preprocess((val: any) => {
                if (!val) return undefined;
                // Accept ISO date strings from the client
                const d = new Date(String(val));
                return isNaN(d.getTime()) ? undefined : d;
            }, z.date().optional()),
            acquisition_location: z.string().optional().nullable().default(""),
            public: z.preprocess((val: any) => {
                if (val === undefined) return true;
                if (typeof val === 'string') return val === 'true' || val === '1';
                return Boolean(val);
            }, z.boolean()).default(true),
            media_images: z.preprocess((val: any) => {
                if (!val) return [];
                if (typeof val === 'string') {
                    try { return JSON.parse(val); } catch { return []; }
                }
                return val;
            }, z.array(z.string()).optional().default([])),
            toy_images: z.preprocess((val: any) => {
                if (!val) return [];
                if (typeof val === 'string') {
                    try { return JSON.parse(val); } catch { return []; }
                }
                return val;
            }, z.array(z.string()).optional().default([])),
            alt_character_name: z.preprocess((val: any) => {
                if (!val) return [];
                if (typeof val === 'string') {
                    try { return JSON.parse(val); } catch { return []; }
                }
                return val;
            }, z.array(z.object({
                name: z.string()
            })).optional().default([])),
            price: z.preprocess((val: any) => {
                if (val === undefined || val === null || val === '') return undefined;
                const n = Number(val);
                return isNaN(n) ? undefined : Math.round(n * 100) / 100;
            }, z.number().min(0).optional()),
            currency: z.preprocess((val: any) => {
                if (!val) return 'USD';
                try { return String(val).toUpperCase(); } catch { return 'USD'; }
            }, z.string().default('USD').refine((c) => ALLOWED_CURRENCIES.includes(String(c).toUpperCase()), { message: 'Invalid currency code' })),
        });

        const parsed = collectionSchema.safeParse(req.body);
        if (!parsed.success) {
            console.warn('Validation failed for addUserCollection:', parsed.error.format());
            return handleError(res, {
                type: 'error',
                status: 400,
                code: 'VALIDATION_ERROR',
                message: 'Invalid data input',
                data: parsed.error.format()
            });
        }

        // Use the validated data from parsed.data
        const {
            character_name,
            character_primary_faction,
            character_description,
            toy_line,
            toy_class,
            collection_notes,
            acquisition_date,
            acquisition_location,
            public: isPublic,
            media_images,
            toy_images,
            alt_character_name,
            price,
            currency,
        } = parsed.data;

        // Validate required fields
        if (!character_name || !character_primary_faction) {
            return handleError(res, {
                type: 'error',
                status: 400,
                code: 'VALIDATION_ERROR',
                message: "character_name and character_primary_faction are required fields"
            });
        }

        // Initialize Saga Transaction
        const saga = new EnhancedSagaTransaction(true); // Use MongoDB transactions
        const uploadedMediaUrls: string[] = [];
        const uploadedToyUrls: string[] = [];
        let savedCollection: userCollectionDocument | null = null;

        // Step 1: Upload media images if provided
        if (req.files && typeof req.files === 'object' && !Array.isArray(req.files) && req.files['media_images']) {
            const mediaFiles = Array.isArray(req.files['media_images'])
                ? req.files['media_images']
                : [req.files['media_images']];

            console.log(`Processing ${mediaFiles.length} media files`);

            saga.addStep(EnhancedSagaTransaction.createCloudinaryUploadStep(
                'upload_media_images',
                async () => {
                    const mediaUploadPromises = mediaFiles.map(async (file) => {
                        const imageUrl = await uploadImage(
                            file,
                            req.user,
                            res,
                            `cybertron_codex/user_collection_images/media/${userId}`
                        );
                        return imageUrl;
                    });

                    const uploadResults = await Promise.all(mediaUploadPromises);
                    const successfulUploads = uploadResults.filter(url => url !== null) as string[];
                    media_images.push(...successfulUploads);
                    console.log(`Successfully uploaded ${successfulUploads.length} out of ${mediaFiles.length} media files`);
                    return successfulUploads;
                },
                uploadedMediaUrls
            ));
        }

        // Step 2: Upload toy images if provided
        if (req.files && typeof req.files === 'object' && !Array.isArray(req.files) && req.files['toy_images']) {
            const toyFiles = Array.isArray(req.files['toy_images'])
                ? req.files['toy_images']
                : [req.files['toy_images']];

            console.log(`Processing ${toyFiles.length} toy files`);

            saga.addStep(EnhancedSagaTransaction.createCloudinaryUploadStep(
                'upload_toy_images',
                async () => {
                    const toyUploadPromises = toyFiles.map(async (file) => {
                        const imageUrl = await uploadImage(
                            file,
                            req.user,
                            res,
                            `cybertron_codex/user_collection_images/toy/${userId}`
                        );
                        return imageUrl;
                    });

                    const uploadResults = await Promise.all(toyUploadPromises);
                    const successfulUploads = uploadResults.filter(url => url !== null) as string[];
                    toy_images.push(...successfulUploads);
                    console.log(`Successfully uploaded ${successfulUploads.length} out of ${toyFiles.length} toy files`);
                    return successfulUploads;
                },
                uploadedToyUrls
            ));
        }

        // Step 3: Create and save MongoDB document
        saga.addStep(EnhancedSagaTransaction.createMongoStep(
            'create_collection_document',
            async () => {
                // Create the new collection data object
                const collectionData = {
                    character_name,
                    character_primary_faction,
                    character_description: character_description || "",
                    toy_line: toy_line || "",
                    toy_class: toy_class || "",
                    media_images,
                    toy_images,
                    collection_notes: collection_notes || "",
                    acquisition_date: acquisition_date ? new Date(acquisition_date) : undefined,
                    acquisition_location: acquisition_location || "",
                    price: price ?? 0.0,
                    currency: currency || 'USD',
                    alt_character_name,
                    user_id: req.user!._id,
                    user_profile_id: req.user!.profile_id,
                    public: isPublic
                };

                // console.log("Final collection data to save:", JSON.stringify(collectionData, null, 2));

                // Create and save the new collection
                const newCollection = new UserCollectionModel(collectionData);
                savedCollection = await newCollection.save();
                console.log("User collection added successfully.");
                return savedCollection;
            },
            async () => {
                // Compensating action: Delete the created document
                if (savedCollection && (savedCollection as any)._id) {
                    console.log(`[Saga] Deleting created collection document: ${(savedCollection as any)._id}`);
                    await UserCollectionModel.findByIdAndDelete((savedCollection as any)._id);
                }
            }
        ));

        // Execute the saga
        const result = await saga.execute();

        return handleSuccess(res, {
            type: 'success',
            status: 201,
            code: 'COLLECTION_CREATED',
            message: "Collection added successfully",
            data: result
        });

    } catch (error) {
        console.error("Error adding user collection:", error);
        handleError(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: "Failed to add user collection",
            data: error
        });
    }
};

// Favorites handlers
export const getMyFavorites = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return handleError(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: 'Unauthorized access',
            });
        }
        // include user_id in the nested profile population so the client can
        // determine ownership (used to show Edit/Delete controls)
        const favorites = await UserFavoriteModel.find({ user_profile_id: req.user.profile_id }).populate({ path: 'collection_item_id', populate: { path: 'user_profile_id', select: 'user_id first_name last_name' } }).sort({ createdAt: -1 });
        return handleSuccess(res, {
            type: 'success',
            status: 200,
            code: 'SUCCESS',
            message: 'Favorites retrieved',
            data: favorites,
        });
    } catch (err) {
        handleError(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to retrieve favorites',
            data: err
        });
    }
};

export const addFavorite = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return handleError(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: 'Unauthorized access',
            });
        }
        const collectionItemId = req.params.collectionId;
        if (!collectionItemId) {
            return handleError(res, { type: 'error', status: 400, code: 'BAD_REQUEST', message: 'collectionId required' });
        }
        // ensure not duplicated
        const exists = await UserFavoriteModel.findOne({ user_profile_id: req.user.profile_id, collection_item_id: collectionItemId });
        if (exists) {
            return handleSuccess(res, { type: 'success', status: 200, code: 'ALREADY_FAVORITED', message: 'Already favorited', data: exists });
        }
        const created = await UserFavoriteModel.create({ user_profile_id: req.user.profile_id, collection_item_id: collectionItemId });
        return handleSuccess(res, { type: 'success', status: 201, code: 'FAVORITED', message: 'Collection item favorited', data: created });
    } catch (err) {
        handleError(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to add favorite',
            data: err
        });
    }
};

export const removeFavorite = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return handleError(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: 'Unauthorized access',
            });
        }
        const collectionItemId = req.params.collectionId;
        if (!collectionItemId) {
            return handleError(res, { type: 'error', status: 400, code: 'BAD_REQUEST', message: 'collectionId required' });
        }
        const deleted = await UserFavoriteModel.findOneAndDelete({ user_profile_id: req.user.profile_id, collection_item_id: collectionItemId });
        if (!deleted) {
            return handleError(res, { type: 'error', status: 404, code: 'NOT_FOUND', message: 'Favorite not found' });
        }
        return handleSuccess(res, { type: 'success', status: 200, code: 'UNFAVORITED', message: 'Favorite removed' });
    } catch (err) {
        handleError(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to remove favorite',
            data: err
        });
    }
};


// Function for editing user collections
export const editUserCollectionById = async (req: Request, res: Response) => {
    try {
        console.log("Editing user collection with data from request body");
        console.log("Files received:", req.files?.length);

        console.log("User profile retrieved on server");

        if (!req.user || !req.user._id) {
            return handleSuccess(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: "Unauthorized access"
            });
        }
        const userId = req.user._id?.toString();
        const userProfileId = req.user.profile_id; // This was attached to the http request during the validate token process
        const collectionItemId: string = req.params.itemId; // Get collection ID from URL params

        if (!collectionItemId) {
            return handleError(res, {
                type: 'error',
                status: 400,
                code: 'BAD_REQUEST',
                message: "Collection item ID is required"
            });
        }

        // Check if the collection item exists and belongs to the user
        const existingCollectionItem = await UserCollectionModel.findOne({
            _id: collectionItemId,
            user_profile_id: userProfileId
        });

        if (!existingCollectionItem) {
            return handleError(res, {
                type: 'error',
                status: 404,
                code: 'NOT_FOUND',
                message: "Collection item not found or you don't have permission to edit it"
            });
        }

        // Validate & parse incoming edit payload using Zod (all fields optional)
        const editSchema = z.object({
            character_name: z.string().min(1).optional(),
            character_primary_faction: z.enum(["Autobot", "Decepticon"]).optional(),
            character_description: z.string().optional().nullable(),
            toy_line: z.string().optional().nullable(),
            toy_class: z.string().optional().nullable(),
            collection_notes: z.string().optional().nullable(),
            acquisition_date: z.preprocess((val: any) => {
                if (!val) return undefined;
                const d = new Date(String(val));
                return isNaN(d.getTime()) ? undefined : d;
            }, z.date().optional()),
            acquisition_location: z.string().optional().nullable(),
            public: z.preprocess((val: any) => {
                if (val === undefined) return undefined;
                if (typeof val === 'string') return val === 'true' || val === '1';
                return Boolean(val);
            }, z.boolean().optional()),
            imagesToDelete: z.any().optional(),
            media_images: z.preprocess((val: any) => {
                if (!val) return undefined;
                if (typeof val === 'string') {
                    try { return JSON.parse(val); } catch { return undefined; }
                }
                return val;
            }, z.array(z.string()).optional()),
            toy_images: z.preprocess((val: any) => {
                if (!val) return undefined;
                if (typeof val === 'string') {
                    try { return JSON.parse(val); } catch { return undefined; }
                }
                return val;
            }, z.array(z.string()).optional()),
            alt_character_name: z.preprocess((val: any) => {
                if (!val) return undefined;
                if (typeof val === 'string') {
                    try { return JSON.parse(val); } catch { return undefined; }
                }
                return val;
            }, z.array(z.object({
                name: z.string()
            })).optional()),
            // price and currency may come as strings from FormData
            price: z.preprocess((val: any) => {
                if (val === undefined || val === null || val === '') return undefined;
                const n = Number(val);
                return isNaN(n) ? undefined : Math.round(n * 100) / 100;
            }, z.number().min(0).optional()),
            currency: z.preprocess((val: any) => {
                if (!val) return undefined;
                try { return String(val).toUpperCase(); } catch { return undefined; }
            }, z.string().optional().refine((c) => c === undefined ? true : ALLOWED_CURRENCIES.includes(String(c).toUpperCase()), { message: 'Invalid currency code' })),
        });

        const parsed = editSchema.safeParse(req.body);
        if (!parsed.success) {
            console.warn('Validation failed for editUserCollectionById:', parsed.error.format());
            return handleError(res, {
                type: 'error',
                status: 400,
                code: 'VALIDATION_ERROR',
                message: 'Invalid data input',
                data: parsed.error.format()
            });
        }

        const {
            character_name,
            character_primary_faction,
            character_description,
            toy_line,
            toy_class,
            collection_notes,
            acquisition_date,
            acquisition_location,
            public: isPublic,
            imagesToDelete,
            media_images: parsed_media_images,
            toy_images: parsed_toy_images,
            alt_character_name: parsed_alt_character_name,
            // price and currency may come as strings from FormData (parsed above)
            price,
            currency
        } = parsed.data;

        // Use parsed arrays from Zod when present, otherwise parse raw body and fall back to existing values
        let media_images: any = parsed_media_images !== undefined ? parsed_media_images : undefined;
        let toy_images: any = parsed_toy_images !== undefined ? parsed_toy_images : undefined;
        let alt_character_name: any = parsed_alt_character_name !== undefined ? parsed_alt_character_name : undefined;

        // If parsed values were not provided, try to parse them from req.body (stringified FormData) or fall back to existing item
        if (media_images === undefined) {
            media_images = req.body.media_images;
            if (typeof media_images === 'string') {
                try { media_images = JSON.parse(media_images); } catch { media_images = existingCollectionItem.media_images || []; }
            }
            if (!Array.isArray(media_images)) media_images = existingCollectionItem.media_images || [];
        }

        if (toy_images === undefined) {
            toy_images = req.body.toy_images;
            if (typeof toy_images === 'string') {
                try { toy_images = JSON.parse(toy_images); } catch { toy_images = existingCollectionItem.toy_images || []; }
            }
            if (!Array.isArray(toy_images)) toy_images = existingCollectionItem.toy_images || [];
        }

        if (alt_character_name === undefined) {
            alt_character_name = req.body.alt_character_name;
            if (typeof alt_character_name === 'string') {
                try { alt_character_name = JSON.parse(alt_character_name); } catch { alt_character_name = existingCollectionItem.alt_character_name || []; }
            }
            if (!Array.isArray(alt_character_name)) alt_character_name = existingCollectionItem.alt_character_name || [];
        }

        // Parse price and currency values which may arrive as strings via FormData
        let priceVal: any = price;
        let currencyVal: any = currency;

        if (priceVal === undefined || priceVal === null || priceVal === '') {
            priceVal = undefined;
        } else {
            const n = Number(priceVal);
            priceVal = isNaN(n) ? undefined : Math.round(n * 100) / 100;
        }

        if (currencyVal === '') {
            currencyVal = undefined;
        }

        // Initialize Saga Transaction
        const saga = new EnhancedSagaTransaction(true);
        const newUploadedMediaUrls: string[] = [];
        const newUploadedToyUrls: string[] = [];
        const deletedImageUrls: string[] = [];
        let updatedCollection: any = null;
        let originalCollectionData: any = null;

        // Step 1: Delete images from Cloudinary if requested
        if (imagesToDelete && typeof imagesToDelete === 'string') {
            try {
                const imagesToDeleteArray = JSON.parse(imagesToDelete);
                if (Array.isArray(imagesToDeleteArray) && imagesToDeleteArray.length > 0) {
                    saga.addStep({
                        name: 'delete_old_images',
                        execute: async () => {
                            // Filter out images to delete from arrays
                            media_images = media_images.filter((img: string) => !imagesToDeleteArray.includes(img));
                            toy_images = toy_images.filter((img: string) => !imagesToDeleteArray.includes(img));

                            // Delete from Cloudinary
                            const deletePromises = imagesToDeleteArray.map(url => removeImages([url]));
                            await Promise.all(deletePromises);
                            deletedImageUrls.push(...imagesToDeleteArray);
                            console.log(`Deleted ${imagesToDeleteArray.length} images from Cloudinary`);
                            return imagesToDeleteArray;
                        },
                        compensate: async () => {
                            // Note: Cannot restore deleted Cloudinary images, 
                            // but we can revert database changes in subsequent steps
                            console.log('[Saga] Cannot restore deleted Cloudinary images, relying on database rollback');
                        },
                        retries: 2
                    });
                }
            } catch (e) {
                return handleError(res, {
                    type: 'error',
                    status: 400,
                    code: 'BAD_REQUEST',
                    message: "Invalid imagesToDelete format",
                    data: e
                });
            }
        }

        // Step 2: Upload new media images if provided
        if (req.files && typeof req.files === 'object' && !Array.isArray(req.files) && req.files['media_images']) {
            const mediaFiles = Array.isArray(req.files['media_images'])
                ? req.files['media_images']
                : [req.files['media_images']];

            saga.addStep(EnhancedSagaTransaction.createCloudinaryUploadStep(
                'upload_new_media_images',
                async () => {
                    const mediaUploadPromises = mediaFiles.map(async (file) => {
                        const imageUrl = await uploadImage(
                            file,
                            req.user,
                            res,
                            `cybertron_codex/user_collection_images/media/${userId}`
                        );
                        return imageUrl;
                    });

                    const uploadResults = await Promise.all(mediaUploadPromises);
                    const successfulUploads = uploadResults.filter(url => url !== null) as string[];
                    media_images.push(...successfulUploads);
                    console.log(`Successfully uploaded ${successfulUploads.length} out of ${mediaFiles.length} media files`);
                    return successfulUploads;
                },
                newUploadedMediaUrls
            ));
        }

        // Step 3: Upload new toy images if provided
        if (req.files && typeof req.files === 'object' && !Array.isArray(req.files) && req.files['toy_images']) {
            const toyFiles = Array.isArray(req.files['toy_images'])
                ? req.files['toy_images']
                : [req.files['toy_images']];

            saga.addStep(EnhancedSagaTransaction.createCloudinaryUploadStep(
                'upload_new_toy_images',
                async () => {
                    const toyUploadPromises = toyFiles.map(async (file) => {
                        const imageUrl = await uploadImage(
                            file,
                            req.user,
                            res,
                            `cybertron_codex/user_collection_images/toy/${userId}`
                        );
                        return imageUrl;
                    });

                    const uploadResults = await Promise.all(toyUploadPromises);
                    const successfulUploads = uploadResults.filter(url => url !== null) as string[];
                    toy_images.push(...successfulUploads);
                    console.log(`Successfully uploaded ${successfulUploads.length} out of ${toyFiles.length} toy files`);
                    return successfulUploads;
                },
                newUploadedToyUrls
            ));
        }

        // Step 4: Update MongoDB document
        saga.addStep(EnhancedSagaTransaction.createMongoStep(
            'update_collection_document',
            async () => {
                // Store original data for rollback
                originalCollectionData = existingCollectionItem.toObject();

                // Build the update object
                const updateData: any = {};

                // Only update fields that are provided
                if (character_name !== undefined) updateData.character_name = character_name;
                if (character_primary_faction !== undefined) updateData.character_primary_faction = character_primary_faction;
                if (character_description !== undefined) updateData.character_description = character_description;
                if (toy_line !== undefined) updateData.toy_line = toy_line;
                if (toy_class !== undefined) updateData.toy_class = toy_class;
                if (collection_notes !== undefined) updateData.collection_notes = collection_notes;
                if (acquisition_date !== undefined) {
                    updateData.acquisition_date = acquisition_date ? new Date(acquisition_date) : null;
                }
                if (acquisition_location !== undefined) updateData.acquisition_location = acquisition_location;
                if (isPublic !== undefined) updateData.public = isPublic;

                // Include price and currency when provided
                if (priceVal !== undefined) updateData.price = priceVal;
                if (currencyVal !== undefined) updateData.currency = currencyVal;

                // Always update arrays (they might have been modified by file uploads or deletions)
                updateData.media_images = media_images;
                updateData.toy_images = toy_images;
                updateData.alt_character_name = alt_character_name;

                // console.log("Final data to update:", JSON.stringify(updateData, null, 2));

                // Update the collection
                updatedCollection = await UserCollectionModel.findOneAndUpdate(
                    { _id: collectionItemId, user_profile_id: userProfileId },
                    updateData,
                    { new: true }
                );

                if (!updatedCollection) {
                    throw new Error("Collection not found or update failed");
                }

                console.log("Collection updated successfully");
                return updatedCollection;
            },
            async () => {
                // Compensating action: Restore original document state
                if (originalCollectionData) {
                    console.log(`[Saga] Restoring original collection data for ID: ${collectionItemId}`);
                    await UserCollectionModel.findByIdAndUpdate(collectionItemId, originalCollectionData);
                }
            }
        ));

        // Execute the saga
        const result = await saga.execute();

        return handleSuccess(res, {
            type: 'success',
            status: 200,
            code: 'COLLECTION_UPDATED',
            message: "Collection updated successfully",
            data: result
        });

    } catch (error) {
        console.error("Error updating user collection:", error);
        handleError(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: "An error occurred while updating the collection",
            data: error
        })
    }
};


export const deleteUserCollectionItem = async (req: Request, res: Response) => {
    const { itemId } = req.params;
    console.log("Deleting collection item with ID:", itemId);

    try {
        // Find the collection by ID
        const collectionItem = await UserCollectionModel.findById(itemId)
            .populate<{ user_profile_id: { user_id: string } }>('user_profile_id', "user_id ");

        if (!collectionItem) {
            console.error("Collection item not found:", itemId);
            return handleError(res, {
                type: 'error',
                status: 404,
                code: 'NOT_FOUND',
                message: "Collection not found"
            });
        }

        // Ensure the collection belongs to the authenticated user
        console.log("Collection item user profile ID:", collectionItem.user_profile_id);
        console.log("Requesting user ID:", req.user?._id);
        if (String(collectionItem.user_profile_id?.user_id) !== String(req.user?._id)) {
            console.error("Unauthorized deletion attempt by user:", req.user?._id);
            return res.status(403).json({ error: "Unauthorized to delete this collection" });
        }

        // Initialize Saga Transaction
        const saga = new EnhancedSagaTransaction(true);
        let deletedCollection: any = null;
        let deletedComments: any[] = [];
        let deletedFavorites: any[] = [];
        const imagesToDelete = [...(collectionItem.media_images || []), ...(collectionItem.toy_images || [])];

        // Step 1: Delete related comments
        saga.addStep(EnhancedSagaTransaction.createMongoStep(
            'delete_collection_comments',
            async () => {
                // Store comments for potential restore
                deletedComments = await CollectionCommentModel.find({ collection_item_id: itemId }).lean();
                const commentsDeleted = await CollectionCommentModel.deleteMany({ collection_item_id: itemId });
                console.log(`Deleted ${commentsDeleted.deletedCount || 0} comments for collection ${itemId}`);
                return commentsDeleted;
            },
            async () => {
                // Compensating action: Restore deleted comments
                if (deletedComments.length > 0) {
                    console.log(`[Saga] Restoring ${deletedComments.length} comments for collection ${itemId}`);
                    await CollectionCommentModel.insertMany(deletedComments);
                }
            }
        ));

        // Step 2: Delete related favorites
        saga.addStep(EnhancedSagaTransaction.createMongoStep(
            'delete_collection_favorites',
            async () => {
                // Store favorites for potential restore
                deletedFavorites = await UserFavoriteModel.find({ collection_item_id: itemId }).lean();
                const favoritesDeleted = await UserFavoriteModel.deleteMany({ collection_item_id: itemId });
                console.log(`Deleted ${favoritesDeleted.deletedCount || 0} favorites for collection ${itemId}`);
                return favoritesDeleted;
            },
            async () => {
                // Compensating action: Restore deleted favorites
                if (deletedFavorites.length > 0) {
                    console.log(`[Saga] Restoring ${deletedFavorites.length} favorites for collection ${itemId}`);
                    await UserFavoriteModel.insertMany(deletedFavorites);
                }
            }
        ));

        // Step 3: Delete images from Cloudinary
        if (imagesToDelete.length > 0) {
            saga.addStep({
                name: 'delete_cloudinary_images',
                execute: async () => {
                    console.log(`Deleting ${imagesToDelete.length} images from Cloudinary`);
                    await removeImages(imagesToDelete);
                    return imagesToDelete;
                },
                compensate: async () => {
                    // Note: Cannot restore deleted Cloudinary images
                    console.log('[Saga] Cannot restore deleted Cloudinary images');
                },
                retries: 2
            });
        }

        // Step 4: Delete the collection document
        saga.addStep(EnhancedSagaTransaction.createMongoStep(
            'delete_collection_document',
            async () => {
                // Store collection for potential restore
                deletedCollection = collectionItem.toObject();
                const result = await UserCollectionModel.findByIdAndDelete(itemId);
                if (!result) {
                    throw new Error("Failed to delete collection document");
                }
                console.log(`Collection ${itemId} deleted successfully`);
                return result;
            },
            async () => {
                // Compensating action: Restore deleted collection
                if (deletedCollection) {
                    console.log(`[Saga] Restoring collection document: ${itemId}`);
                    // Remove _id to allow Mongoose to create a new one, but we need the original _id
                    const { _id, ...collectionData } = deletedCollection;
                    const restoredCollection = new UserCollectionModel({ ...collectionData, _id });
                    await restoredCollection.save();
                }
            }
        ));

        // Execute the saga
        await saga.execute();

        return handleSuccess(res, {
            type: 'success',
            status: 200,
            code: 'COLLECTION_DELETED',
            message: "Collection item deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting collection item:", error);
        return handleError(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: "Failed to delete collection item",
            data: error
        });
    }
};

// Comments
export const getCommentsForCollection = async (req: Request, res: Response) => {
    try {
        const { collectionId } = req.params;
        if (!req.user) {
            return handleError(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: 'Unauthorized access'
            });
        }
        const comments = await CollectionCommentModel.find({ collection_item_id: collectionId }).populate('user_profile_id', 'user_id first_name last_name').sort({ createdAt: -1 });
        return handleSuccess(res, {
            type: 'success',
            status: 200,
            code: 'SUCCESS',
            message: 'Comments retrieved successfully',
            data: comments
        });
    } catch (error) {
        return handleError(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch comments',
            data: error
        });
    }
};

export const addCommentToCollection = async (req: Request, res: Response) => {
    try {
        const { collectionId } = req.params;
        const { content } = req.body;
        if (!req.user || !req.user.profile_id) {
            return handleError(res, {
                type: 'error',
                status: 401,
                code: 'UNAUTHORIZED',
                message: 'Unauthorized access'
            });
        }
        if (!content || typeof content !== 'string' || !content.trim()) {
            return handleError(res, {
                type: 'error',
                status: 400,
                code: 'VALIDATION_ERROR',
                message: 'Comment content cannot be empty'
            });
        }

        // Ensure collection exists
        const collection = await UserCollectionModel.findById(collectionId);
        if (!collection) {
            return handleError(res, {
                type: 'error',
                status: 404,
                code: 'NOT_FOUND',
                message: 'Collection not found'
            });
        }

        const newComment = new CollectionCommentModel({
            collection_item_id: collectionId,
            user_profile_id: req.user.profile_id,
            content: content.trim(),
        });

        const saved = await newComment.save();
        return handleSuccess(res, {
            type: 'success',
            status: 201,
            code: 'COMMENT_CREATED',
            message: 'Comment added successfully',
            data: saved
        });
    } catch (error) {
        return handleError(res, {
            type: 'error',
            status: 500,
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to add comment',
            data: error
        });
    }
};

export const editComment = async (req: Request, res: Response) => {
    try {
        const { collectionId, commentId } = req.params;
        const { content } = req.body;
        if (!req.user || !req.user.profile_id) {
            return handleError(res, { type: 'error', status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized access' });
        }
        if (!content || typeof content !== 'string' || !content.trim()) {
            return handleError(res, { type: 'error', status: 400, code: 'VALIDATION_ERROR', message: 'Content cannot be empty' });
        }

        const comment = await CollectionCommentModel.findById(commentId);
        if (!comment) {
            return handleError(res, { type: 'error', status: 404, code: 'NOT_FOUND', message: 'Comment not found' });
        }

        // Owner-only
        if (String(comment.user_profile_id) !== String(req.user.profile_id)) {
            return handleError(res, { type: 'error', status: 403, code: 'FORBIDDEN', message: 'Not authorized to edit this comment' });
        }

        comment.content = content.trim();
        const saved = await comment.save();
        return handleSuccess(res, { type: 'success', status: 200, code: 'COMMENT_UPDATED', message: 'Comment updated', data: saved });
    } catch (error) {
        return handleError(res, { type: 'error', status: 500, code: 'INTERNAL_SERVER_ERROR', message: 'Failed to edit comment', data: error });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { collectionId, commentId } = req.params;
        if (!req.user || !req.user.profile_id) {
            return handleError(res, { type: 'error', status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized access' });
        }

        const comment = await CollectionCommentModel.findById(commentId);
        if (!comment) {
            return handleError(res, { type: 'error', status: 404, code: 'NOT_FOUND', message: 'Comment not found' });
        }

        // Owner-only
        if (String(comment.user_profile_id) !== String(req.user.profile_id)) {
            return handleError(res, { type: 'error', status: 403, code: 'FORBIDDEN', message: 'Not authorized to delete this comment' });
        }

        await CollectionCommentModel.findByIdAndDelete(commentId);
        return handleSuccess(res, { type: 'success', status: 200, code: 'COMMENT_DELETED', message: 'Comment deleted' });
    } catch (error) {
        return handleError(res, { type: 'error', status: 500, code: 'INTERNAL_SERVER_ERROR', message: 'Failed to delete comment', data: error });
    }
};