import { baseUrl } from "~/lib/baseUrl";
import type { SignInFormData, SignUpFormData } from "~/lib/zod";

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
            const errorData = await response.json();
            console.error("Sign-in failed:", errorData);
            return errorData; // From the server side, the error message is already in a JSON format object formatted as { error: "message" }
        }
        const successData = await response.json();
        localStorage.setItem("token", successData.token);

        console.log("Sign-in successful", successData);
        return successData; // This will return three properties: {registered: true, userProfile, token}
    } catch (error) {
        console.error("Sign-in error:", error);
        return { error: "An unexpected error occurred." };

    }

}


export async function signOut() {
    try {
        localStorage.removeItem("token");
        console.log("Sign-out successful");
    } catch (error) {
        console.error("Sign-out error:", error);
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
            const errorData = await response.json();
            console.error("Sign-up failed:", errorData);
            return errorData; // From the server side, the error message is already in a JSON format object formatted as { error: "message" }
        }
        const successData = await response.json();
        localStorage.setItem("token", successData.token);
        console.log("Sign-up successful", successData);
        return successData; // This will return three properties: {registered: true, userProfile, token}
    } catch (error) {
        console.error("Sign-up error:", error);
        return { error: "An unexpected error occurred." };
    }
}