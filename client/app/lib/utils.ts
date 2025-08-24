import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ApiResponse } from "~/type/apiResponse";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function handleApiError(errorData: ApiResponse<null>): Error {
  const error = new Error(errorData.message || "Unknown error");   // The Error constructor makes sure a real Error instance is created, so stack traces, logging tools, and instanceof Error checks behave correctly.
  return Object.assign(error, errorData); // Assign the errorData properties to the error instance (the previous inclusion of errorData.message in the Error constructor was necessary, not redundant). See project-note.md for more details.
}

export function isApiError(error: unknown): error is Error & ApiResponse<null> {
  return typeof error === "object" && error !== null && "code" in error && "message" in error;
}