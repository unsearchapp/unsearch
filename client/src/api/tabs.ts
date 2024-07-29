import { ApiResponse, TabData } from "@/types/api";

export const getTabs = async (lastDate: string): Promise<TabData> => {
	const response = await fetch(`/api/tabs?lastDate=${lastDate}`, {
		credentials: "include"
	});
	const data: TabData = await response.json();
	return data;
};
