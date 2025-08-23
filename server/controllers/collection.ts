import { Request, Response } from "express";
import UserCollectionModel, { userCollectionDocument } from "../db_models/user_collection";
import { handleError } from "../utils/handleError";
import { uploadImage } from "../utils/cloudinaryOperations";
import { removeImages } from "../utils/cloudinaryOperations";

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
        console.log("Requested user: ", req.user);
        console.log("Requested user ID: ", req.user?._id.toString());
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized access" });
        }
        const profiles = await UserCollectionModel.find({
            public: true
        }).populate<{ user_profile_id: { user_id: string; first_name: string; last_name: string; } }>('user_profile_id', "user_id first_name last_name");
        res.status(200).json(profiles);
        console.log(profiles);
    } catch (error) {
        handleError(error, res);
    }
};

export const getMyCollection = async (req: Request, res: Response) => {
    try {
        console.log("Requested user: ", req.user);
        console.log("Requested user ID: ", req.user?._id.toString());
        console.log("Requested user profile ID: ", req.user?.profile_id);
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized access" });
        }
        const myCollection = await UserCollectionModel.find({
            user_profile_id: req.user.profile_id,
        }).populate('user_profile_id', "user_id first_name last_name");
        res.status(200).json(myCollection);
        console.log(myCollection);
    } catch (error) {
        handleError(error, res);
    }
};

export const getCollectionItemById = async (req: Request, res: Response) => {
    try {
        const collectionId: string = req.params.collectionId;
        console.log("Requested collection ID: ", collectionId);
        console.log("Requested user ID: ", req.user?._id.toString());
        console.log("Requested user profile ID: ", req.user?.profile_id);
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized access" });
        }
        const collectionItem = await UserCollectionModel.findById(collectionId).populate('user_profile_id', "user_id first_name last_name");
        if (!collectionItem) {
            return res.status(404).json({ error: "Collection item not found" });
        }
        res.status(200).json(collectionItem);
        console.log(collectionItem);
    } catch (error) {
        handleError(error, res);
    }
};

// Function for editing user collections
export const editUserCollectionById = async (req: Request, res: Response) => {
    try {
        console.log("Editing user collection with data:", req.body);
        console.log("Files received:", req.files);

        console.log("User profile retrieved on server: ", req.user);

        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "Unauthorized access" });
        }
        const userId = req.user._id.toString();
        const userProfileId = req.user.profile_id; // This was attached to the http request during the validate token process
        const collectionItemId: string = req.params.itemId; // Get collection ID from URL params

        if (!collectionItemId) {
            return res.status(400).json({ error: "Collection item ID is required" });
        }

        // Check if the collection item exists and belongs to the user
        const existingCollectionItem = await UserCollectionModel.findOne({
            _id: collectionItemId,
            user_profile_id: userProfileId
        });

        if (!existingCollectionItem) {
            console.log("Existing collection item not found with ID:", collectionItemId);
            return res.status(404).json({ error: "Collection item not found or you don't have permission to edit it" });
        }

        console.log("Existing collection item found:", existingCollectionItem);

        // Destructure all fields from the body according to userCollectionSchema
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
            imagesToDelete
        } = req.body;

        // Parse stringified arrays from FormData
        let { media_images, toy_images, alt_character_name } = req.body;

        // Initialize arrays with existing data or empty arrays
        if (typeof media_images === 'string') {
            try {
                media_images = JSON.parse(media_images);
            } catch (e) {
                media_images = existingCollectionItem.media_images || [];
            }
        }
        if (!Array.isArray(media_images)) {
            media_images = existingCollectionItem.media_images || [];
        }

        if (typeof toy_images === 'string') {
            try {
                toy_images = JSON.parse(toy_images);
            } catch (e) {
                toy_images = existingCollectionItem.toy_images || [];
            }
        }
        if (!Array.isArray(toy_images)) {
            toy_images = existingCollectionItem.toy_images || [];
        }

        if (typeof alt_character_name === 'string') {
            try {
                alt_character_name = JSON.parse(alt_character_name);
            } catch (e) {
                alt_character_name = existingCollectionItem.alt_character_name || [];
            }
        }
        if (!Array.isArray(alt_character_name)) {
            alt_character_name = existingCollectionItem.alt_character_name || [];
        }

        // Handle images to delete
        if (imagesToDelete && typeof imagesToDelete === 'string') {
            try {
                const imagesToDeleteArray = JSON.parse(imagesToDelete);
                if (Array.isArray(imagesToDeleteArray)) {

                    // The media_images and toy_images were not filtered with marked-to-delete ones on the client side because a imagesToDelete array was needed anyway so they can be removed on Cloudinary on the server side. We might as well filter them here.

                    // Remove images from media_images array
                    media_images = media_images.filter((img: string) => !imagesToDeleteArray.includes(img));
                    // Remove images from toy_images array
                    toy_images = toy_images.filter((img: string) => !imagesToDeleteArray.includes(img));

                    // Execute image deletion from Cloudinary
                    await removeImages(imagesToDeleteArray);
                    console.log(`Deleted ${imagesToDeleteArray.length} images from Cloudinary`);
                }
            } catch (e) {
                console.error("Error parsing imagesToDelete:", e);
            }
        }

        // Handle file uploads - now req.files is an object with field names as keys
        if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
            console.log("Processing uploaded files...");

            // Handle media_images files
            if (req.files['media_images']) {
                const mediaFiles = Array.isArray(req.files['media_images'])
                    ? req.files['media_images']
                    : [req.files['media_images']];

                console.log(`Processing ${mediaFiles.length} media files`);

                const mediaUploadPromises = mediaFiles.map(async (file) => {
                    try {
                        const imageUrl = await uploadImage(
                            file,
                            req.user,
                            res,
                            `cybertron_codex/user_collection_images/media/${userId}`
                        );
                        return imageUrl;
                    } catch (uploadError) {
                        console.error("Error uploading media file:", uploadError);
                        return null;
                    }
                });

                const mediaUploadResults = await Promise.all(mediaUploadPromises);
                const successfulMediaUploads = mediaUploadResults.filter(url => url !== null) as string[];
                media_images.push(...successfulMediaUploads);
                console.log(`Successfully uploaded ${successfulMediaUploads.length} out of ${mediaFiles.length} media files`);
            }

            // Handle toy_images files
            if (req.files['toy_images']) {
                const toyFiles = Array.isArray(req.files['toy_images'])
                    ? req.files['toy_images']
                    : [req.files['toy_images']];

                console.log(`Processing ${toyFiles.length} toy files`);

                const toyUploadPromises = toyFiles.map(async (file) => {
                    try {
                        const imageUrl = await uploadImage(
                            file,
                            req.user,
                            res,
                            `cybertron_codex/user_collection_images/toy/${userId}`
                        );
                        return imageUrl;
                    } catch (uploadError) {
                        console.error("Error uploading toy file:", uploadError);
                        return null;
                    }
                });

                const toyUploadResults = await Promise.all(toyUploadPromises);
                const successfulToyUploads = toyUploadResults.filter(url => url !== null) as string[];
                toy_images.push(...successfulToyUploads);
                console.log(`Successfully uploaded ${successfulToyUploads.length} out of ${toyFiles.length} toy files`);
            }
        }

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

        // Always update arrays (they might have been modified by file uploads or deletions)
        updateData.media_images = media_images;
        updateData.toy_images = toy_images;
        updateData.alt_character_name = alt_character_name;

        console.log("Final data to update:", JSON.stringify(updateData, null, 2));

        // Update the collection
        const updatedCollection = await UserCollectionModel.findOneAndUpdate(
            { _id: collectionItemId, user_profile_id: userProfileId },
            updateData,
            { new: true }
        );

        if (!updatedCollection) {
            return res.status(404).json({ error: "Collection not found or update failed" });
        }

        res.status(200).json({
            success: true,
            collection: updatedCollection,
            message: "Collection updated successfully"
        });
        console.log("User collection updated successfully:", updatedCollection);

    } catch (error) {
        console.error("Error updating user collection:", error);
        handleError(error, res);
    }
};


export const addUserCollection = async (req: Request, res: Response) => {
    try {
        console.log("Adding user collection with data:", req.body);
        console.log("Files received:", req.files);

        if (!req.user || !req.user._id) {
            return res.status(401).json({ error: "Unauthorized access" });
        }

        const userId = req.user._id.toString();


        // Destructure all fields from the body according to userCollectionSchema
        const {
            character_name,
            character_primary_faction,
            character_description,
            toy_line,
            toy_class,
            collection_notes,
            acquisition_date,
            acquisition_location,
            public: isPublic = true
        } = req.body;

        // Parse stringified arrays from FormData
        let { media_images, toy_images, alt_character_name } = req.body;

        // Initialize arrays
        if (typeof media_images === 'string') {
            try {
                media_images = JSON.parse(media_images);
            } catch (e) {
                media_images = [];
            }
        }
        if (!Array.isArray(media_images)) {
            media_images = [];
        }

        if (typeof toy_images === 'string') {
            try {
                toy_images = JSON.parse(toy_images);
            } catch (e) {
                toy_images = [];
            }
        }
        if (!Array.isArray(toy_images)) {
            toy_images = [];
        }

        if (typeof alt_character_name === 'string') {
            try {
                alt_character_name = JSON.parse(alt_character_name);
            } catch (e) {
                alt_character_name = [];
            }
        }
        if (!Array.isArray(alt_character_name)) {
            alt_character_name = [];
        }

        // Handle file uploads - now req.files is an object with field names as keys
        if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
            console.log("Processing uploaded files...");

            // Handle media_images files
            if (req.files['media_images']) {
                const mediaFiles = Array.isArray(req.files['media_images'])
                    ? req.files['media_images']
                    : [req.files['media_images']];

                console.log(`Processing ${mediaFiles.length} media files`);

                const mediaUploadPromises = mediaFiles.map(async (file) => {
                    try {
                        const imageUrl = await uploadImage(
                            file,
                            req.user,
                            res,
                            `cybertron_codex/user_collection_images/media/${userId}`
                        );
                        return imageUrl;
                    } catch (uploadError) {
                        console.error("Error uploading media file:", uploadError);
                        return null;
                    }
                });

                const mediaUploadResults = await Promise.all(mediaUploadPromises);
                const successfulMediaUploads = mediaUploadResults.filter(url => url !== null) as string[];
                media_images.push(...successfulMediaUploads);
                console.log(`Successfully uploaded ${successfulMediaUploads.length} out of ${mediaFiles.length} media files`);
            }

            // Handle toy_images files
            if (req.files['toy_images']) {
                const toyFiles = Array.isArray(req.files['toy_images'])
                    ? req.files['toy_images']
                    : [req.files['toy_images']];

                console.log(`Processing ${toyFiles.length} toy files`);

                const toyUploadPromises = toyFiles.map(async (file) => {
                    try {
                        const imageUrl = await uploadImage(
                            file,
                            req.user,
                            res,
                            `cybertron_codex/user_collection_images/toy/${userId}`
                        );
                        return imageUrl;
                    } catch (uploadError) {
                        console.error("Error uploading toy file:", uploadError);
                        return null;
                    }
                });

                const toyUploadResults = await Promise.all(toyUploadPromises);
                const successfulToyUploads = toyUploadResults.filter(url => url !== null) as string[];
                toy_images.push(...successfulToyUploads);
                console.log(`Successfully uploaded ${successfulToyUploads.length} out of ${toyFiles.length} toy files`);
            }
        }

        // Validate required fields
        if (!character_name || !character_primary_faction) {
            return res.status(400).json({
                error: "character_name and character_primary_faction are required fields"
            });
        }

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
            alt_character_name,
            user_id: req.user._id, // This was attached to the http request during the validate token process
            user_profile_id: req.user.profile_id, // This was attached to the http request during the validate token process
            public: isPublic
        };

        console.log("Final collection data to save:", JSON.stringify(collectionData, null, 2));

        // Create and save the new collection
        const newCollection = new UserCollectionModel(collectionData);
        const savedCollection = await newCollection.save();

        res.status(201).json({
            success: true,
            collection: savedCollection,
            message: "Collection added successfully"
        });
        console.log("User collection added successfully:", savedCollection);

    } catch (error) {
        console.error("Error adding user collection:", error);
        handleError(error, res);
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
            return res.status(404).json({ error: "Collection not found" });
        }

        // Ensure the collection belongs to the authenticated user
        console.log("Collection item user profile ID:", collectionItem.user_profile_id);
        console.log("Requesting user ID:", req.user?._id);
        if (collectionItem.user_profile_id.user_id.toString() !== req.user?._id.toString()) {
            console.error("Unauthorized deletion attempt by user:", req.user?._id);
            return res.status(403).json({ error: "Unauthorized to delete this collection" });
        }

        // Remove associated images from Cloudinary
        const mediaImages = collectionItem.media_images || [];
        const toyImages = collectionItem.toy_images || [];
        const allImages = [...mediaImages, ...toyImages];

        if (allImages.length > 0) {
            await removeImages(allImages);
        }

        // Delete the collection from the database
        const result = await UserCollectionModel.findByIdAndDelete(itemId);
        if (result) {
            res.status(200).json({ message: "Collection item deleted successfully" });
        } else {
            res.status(404).json({ error: "Error deleting collection item" });
        }
    } catch (error) {
        console.error("Error deleting collection item:", error);
        res.status(500).json({ error: "Failed to delete collection item" });
    }
};