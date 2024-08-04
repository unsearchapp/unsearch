import { LogData } from "@/types/api";

export const getLogs = async (page: number): Promise<LogData> => {
	const response = await fetch(`/api/logs?page=${page}`, {
		credentials: "include"
	});
	const data: LogData = await response.json();
	return data;
};
