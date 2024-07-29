import { ApiResponse, TabData } from "@/types/api";

export const getTabs = async (lastDate: string): Promise<TabData> => {
	const response = await fetch(`/api/tabs?lastDate=${lastDate}`, {
		credentials: "include"
	});
	const data: TabData = await response.json();
	return data;
};

export const deleteTab = async (_id: string): Promise<number> => {
	const response = await fetch("/api/tabs", {
		method: "DELETE",
		body: JSON.stringify({ _id }),
		credentials: "include",
		headers: {
			"Content-Type": "application/json"
		}
	});
	const data: ApiResponse<number> = await response.json();
	return data.data;
}