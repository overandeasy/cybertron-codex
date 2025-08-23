import { success } from "zod/v4";
import { themeToast } from "~/components/ThemeToast";
import { baseUrl } from "~/lib/baseUrl"

export const getAllPublicCollections = async () => {
    const response = await fetch(`${baseUrl}/collection/all`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch collections");
    }
    const collections = await response.json();
    console.log("Collections fetched successfully via API.");
    return collections;
};


export const getMyCollection = async () => {
    const response = await fetch(`${baseUrl}/collection/my-collection`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch my collection");
    }
    const myCollection = await response.json();
    console.log("My collection fetched successfully via API.");
    return myCollection;
};

export const getCollectionById = async (collectionId: string) => {
    const response = await fetch(`${baseUrl}/collection/my-collection/${collectionId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch my collection");
    }
    const myCollection = await response.json();
    console.log("My collection item fetched successfully via API.");
    return myCollection;
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
        throw new Error("Failed to add collection");
    }
    const newCollection = await response.json();
    console.log("New collection added successfully via API.");
    return newCollection;
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
            throw new Error("Failed to edit collection");
        }
        const updatedCollection = await response.json();
        console.log("Collection edited successfully via API.");
        return { success: true, result: updatedCollection };
    } catch (error: any) {
        console.error("Error editing collection:", error);
        return { success: false, result: error.message || "Failed to edit collection" };
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
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to delete collection item");
        }

        const result = await response.json();
        console.log("Collection item deleted successfully:", result);
        return { success: true, result: result };
    } catch (error) {
        console.error("Error deleting collection item:", error);
        return { success: false, result: error };
    }
}