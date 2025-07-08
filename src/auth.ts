import { Request, Response } from "express";
import jwt from "jsonwebtoken";

// Define return type clearly
export const verifyTokenHelper = async (req: Request, res: Response): Promise<boolean> => {
    try {
        const authHeader = req.headers.authorization || "";

        if (!authHeader) {
            return false;
        }

        const token = authHeader.split(" ").pop();
        if (!token) {
            return false;
        }

        // Replace string with your actual env var
        const secretKey = process.env.JWT_SECRET as string;

        const decoded = jwt.verify(token, secretKey);

        if (decoded) {
            return true;
        } else {
            return false;
        }

    } catch (err) {
        console.error("Token is invalid:", err);
        return false;
    }
};
