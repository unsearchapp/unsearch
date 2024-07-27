import jwt from "jsonwebtoken";
import { logger } from "../../utils/logger";

export const validateToken = (token: string): { userId: string } | null => {
	try {
		return jwt.verify(token, process.env.JWT_SECRET as string) as {
			userId: string;
		};
	} catch (error) {
		logger.error(error, "Error on token validation")
		return null;
	}
};
