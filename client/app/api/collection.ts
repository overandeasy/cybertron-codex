
import { baseUrl } from "~/lib/baseUrl"
import { handleApiError, isApiError } from "~/lib/utils";
import type { UserCollection } from "~/lib/zod";
import type { ApiResponse } from "~/type/apiResponse";

export const getAllPublicCollections = async () => {
    try {
        const response = await fetch(`${baseUrl}/collection/all`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        if (!response.ok) {
            const errorData: ApiResponse<null> = await response.json();
            console.error("Fetching collections failed:", errorData);
            throw handleApiError(errorData);
        }
        const publicCollections: ApiResponse<UserCollection[]> = await response.json();
        console.log("Public collections fetched successfully via API.");
        return publicCollections.data;
    } catch (error) {
        if (isApiError(error)) {
            console.error("Error fetching public collections:", error);
            throw error;
        }
        console.error("Unknown error fetching public collections:", error);
        throw error; //At least a .message property is expected.
    }

};


export const getMyCollection = async () => {
    const response = await fetch(`${baseUrl}/collection/my-collection`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    if (!response.ok) {
        const errorData: ApiResponse<null> = await response.json();
        console.error("Fetching my collection failed:", errorData);
        throw handleApiError(errorData);
    }
    const myCollection: ApiResponse<UserCollection> = await response.json();
    console.log("My collection fetched successfully via API.");
    return myCollection.data;
};


// getCollectionItemById is currently not being used
export const getCollectionItemById = async (collectionId: string) => {
    const response = await fetch(`${baseUrl}/collection/my-collection/${collectionId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    if (!response.ok) {
        const errorData: ApiResponse<null> = await response.json();
        console.error("Fetching collection item failed:", errorData);
        throw handleApiError(errorData);
    }
    const collectionItem: ApiResponse<UserCollection> = await response.json();
    console.log("My collection item fetched successfully via API.");
    return collectionItem.data;
};

export const addCollection = async (collectionData: FormData) => {
    const response = await fetch(`${baseUrl}/collection/my-collection/add`, {
        method: "POST",
        body: collectionData,
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    if (!response.ok) {
        const errorData: ApiResponse<null> = await response.json();
        console.error("Adding new collection failed:", errorData);
        throw handleApiError(errorData);
    }
    const newCollection: ApiResponse<UserCollection> = await response.json();
    console.log("New collection added successfully via API.");
    return newCollection.data;
};

export const editCollection = async (itemId: string, collectionData: FormData) => {
    try {
        const response = await fetch(`${baseUrl}/collection/my-collection/${itemId}/edit`, {
            method: "POST",
            body: collectionData,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        if (!response.ok) {
            const errorData: ApiResponse<null> = await response.json();
            console.error("Editing collection failed:", errorData);
            throw handleApiError(errorData);
        }
        const updatedCollection: ApiResponse<UserCollection> = await response.json();
        console.log("Collection edited successfully via API.");
        return updatedCollection;
    } catch (error: any) {
        if (isApiError(error)) {
            console.error("Error editing collection:", error);
            throw error;
        }
        console.error("Unknown error editing collection:", error);
        throw error; //At least a .message property is expected.
    }
};


export const deleteCollectionItem = async (collectionId: string) => {
    try {
        const response = await fetch(`${baseUrl}/collection/my-collection/${collectionId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData: ApiResponse<null> = await response.json();
            console.error("Deleting collection item failed:", errorData);
            throw handleApiError(errorData);
        }

        const result: ApiResponse<null> = await response.json();
        console.log("Collection item deleted successfully:", result);
        return result; // There is no .data property for this particular response. Returning the whole result object instead.
    } catch (error) {
        if (isApiError(error)) {
            console.error("Error deleting collection item:", error);
            throw error;
        }
        console.error("Unknown error deleting collection item:", error);
        throw error; //At least a .message property is expected.
    }
}