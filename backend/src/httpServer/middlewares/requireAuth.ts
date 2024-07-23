import { Request, Response, NextFunction } from "express";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
	if (req.isAuthenticated() && req.user) {
		return next();
	}
	// If not authenticated, redirect to the login page or send an error response
	res.status(401).json({ message: "Unauthorized" });
};
