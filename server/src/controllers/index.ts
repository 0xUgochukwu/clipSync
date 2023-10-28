import { Request, Response } from "express";

/**
 * GET /
 * Home/Health
 */
export const index = async (req: Request, res: Response): Promise<void> => {
    res.status(200);
    res.json({
        message: "Server: ClipSync is healthy",
        status: 200,
        success: true
    });
};
