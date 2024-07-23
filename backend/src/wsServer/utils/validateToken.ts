import jwt from "jsonwebtoken";

export const validateToken = (token: string): { userId: string } | null => {
	try {
		return jwt.verify(token, process.env.JWT_SECRET as string) as {
			userId: string;
		};
	} catch (error) {
		return null;
	}
};
