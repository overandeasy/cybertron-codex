import { baseUrl } from "~/lib/baseUrl";
import { handleApiError, isApiError } from "~/lib/utils";
import type { SignInFormData, SignUpFormData, UserProfile } from "~/lib/zod";
import type { ApiResponse } from "~/type/apiResponse";

export async function signIn(data: SignInFormData) {

    try {
        const response = await fetch(`${baseUrl}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData: ApiResponse<null> = await response.json();
            console.error("Sign-in failed:", errorData);
            throw handleApiError(errorData);
        }
        const successData: ApiResponse<{ registered: boolean; userProfile: UserProfile; token: string }> = await response.json();
        localStorage.setItem("token", successData.data!.token);

        console.log("Sign-in successful");
        return successData.data; // The data object contains three properties: {registered: true, userProfile, token}
    } catch (error: unknown) {
        // isApiError is a type guard function to check if the error object conforms to the ApiResponse<null> structure.
        if (isApiError(error)) {
            console.error("Typed API error:", error.code);
            throw error;
        }
        console.error("Unknown error:", error);
        throw error;
    }

}


export async function signOut() {
    try {
        localStorage.removeItem("token");
        console.log("Sign-out successful");
    } catch (error) {
        console.error("Sign-out error:", error);
        throw error;
    }
}

export async function signUp(data: SignUpFormData) {

    try {
        const response = await fetch(`${baseUrl}/auth/sign-up`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData: ApiResponse<null> = await response.json();
            console.error("Sign-up failed:", errorData);
            throw handleApiError(errorData);
        }
        const successData: ApiResponse<{ authenticated: boolean; userProfile: UserProfile; token: string }> = await response.json();
        localStorage.setItem("token", successData.data!.token);
        console.log("Sign-up successful");
        return successData.data; // The data object contains three properties: {registered: true, userProfile, token}
    } catch (error: any) {
        //The error object is typed as <ApiResponse<null>> as defined in server/utils/handleError.ts. Functions can leverage this type to handle errors consistently. 
        if (isApiError(error)) {
            console.error("Typed API error:", error.code);
            throw error;
        }
        throw error;
    }
}