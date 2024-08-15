import { Session, ApiResponse } from "../types/api";

export const getSessions = async (): Promise<Session[]> => {
	const response = await fetch("/api/sessions", {
		credentials: "include"
	});
	const data: ApiResponse<Session[]> = await response.json();
	return data.data;
};

export const deleteSession = async (sessionId: string): Promise<number> => {
	const response = await fetch("/api/sessions", {
		method: "DELETE",
		body: JSON.stringify({ sessionId }),
		credentials: "include",
		headers: {
			"Content-Type": "application/json"
		}
	});
	const data: ApiResponse<number> = await response.json();
	return data.data;
};

export const logoutSession = async (sessionId: string): Promise<boolean> => {
	const response = await fetch("/api/sessions/logout", {
		method: "POST",
		body: JSON.stringify({ sessionId }),
		credentials: "include",
		headers: {
			"Content-Type": "application/json"
		}
	});
	const data: ApiResponse<boolean> = await response.json();
	return data.data;
};
