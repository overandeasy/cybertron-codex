import { Response } from "express";

export interface ApiResponse<T> {
    type: 'success' | 'error';
    status: number;
    code: string;
    message: string;
    data?: T;
}



export const handleError = <T>(res: Response, payload: ApiResponse<T>) => {

    const { status, code, message } = payload;
    console.error("Error occurred:", payload);
    // Error data included in the payload won't be exposed to http response, but only logged to the server console.
    res.status(status).json({
        type: "error",
        status,
        code,
        message

    });
}

export const handleSuccess = <T>(res: Response, payload: ApiResponse<T>) => {
    const { status, code, message, data } = payload;
    console.log("Success response:", payload);
    res.status(status).json({
        type: 'success',
        status,
        code,
        message,
        data

    });
}