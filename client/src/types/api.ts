export interface Session {
	_id: string;
	browser: string;
}

export interface Bookmark {
	_id: string;
	sessionId: string;
	dateAdded?: Date;
	dateGroupModified?: Date;
	dateLastUsed?: Date;
	id: string;
	index?: number;
	parentId?: string;
	title: string;
	url?: string;
}

export interface HistoryItem {
	_id: string;
	id: string;
	url?: string;
	title?: string;
	lastVisitTime?: Date;
	visitCount?: number;
	typedCount?: number;
}

export interface ApiResponse<T> {
	data: T;
}
