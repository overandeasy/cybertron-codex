import { baseUrl } from "~/lib/baseUrl"

export const getActiveUserProfile = async () => {
    const response = await fetch(`${baseUrl}/user/me`, {
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
    const response = await fetch(`${baseUrl}/user/me/edit`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: data,
    });
    if (!response.ok) {
        throw new Error("Failed to update user profile");
    }
    return response.json();
};