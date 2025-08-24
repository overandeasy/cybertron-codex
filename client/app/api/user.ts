import { baseUrl } from "~/lib/baseUrl"
import { handleApiError, isApiError } from "~/lib/utils";
import type { UserProfile } from "~/lib/zod";
import type { ApiResponse } from "~/type/apiResponse";

export const getActiveUserProfile = async () => {
    try {
        const response = await fetch(`${baseUrl}/user/my-profile`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        if (!response.ok) {
            const errorData: ApiResponse<null> = await response.json();
            console.error("Fetching user profile failed:", errorData);
            throw handleApiError(errorData);
        }
        const userProfile: ApiResponse<UserProfile> = await response.json();
        console.log("User profile fetched successfully via API.");
        return userProfile.data;

    } catch (error: any) {
        if (isApiError(error)) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
        console.error("Unknown error fetching user profile:", error);
        throw error; //At least a .message property is expected.
    }

};


export const updateUserProfile = async (data: FormData) => {
    try {
        const response = await fetch(`${baseUrl}/user/my-profile/edit`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: data,
        });
        if (!response.ok) {
            const errorData: ApiResponse<null> = await response.json();
            console.error("Fetching user profile failed:", errorData);
            throw handleApiError(errorData);
        }
        const updatedUserProfile: ApiResponse<{ updated: boolean, userProfile: UserProfile }> = await response.json();
        return updatedUserProfile.data;
    } catch (error: any) {
        if (isApiError(error)) {
            console.error("Error updating user profile:", error);
            throw error;
        }
        console.error("Unknown error updating user profile:", error);
        throw error; //At least a .message property is expected.
    }


};