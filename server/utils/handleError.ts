import { Response } from "express";

export const handleError = (err: unknown, res: Response) => {
    console.error("Error occurred:", err);
    res.status(500).json({ error: "Internal Server Error" });
}

export const handleNotFound = (res: Response) => {
    res.status(404).json({ error: "Resource not found" });
}