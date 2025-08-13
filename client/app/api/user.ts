import { baseUrl } from "~/lib/baseUrl"

export const getActiveUserProfile = async () => {
    const response = await fetch(`${baseUrl}/user/my-profile`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch user profile");
    }
    const userProfile = await response.json();
    console.log("User profile fetched successfully:", userProfile);
    return userProfile;
};


export const updateUserProfile = async (data: FormData) => {
    try {
        const response = await fetch(`${baseUrl}/user/my-profile/edit`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: data,
        });

        return response;
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;

    }


};