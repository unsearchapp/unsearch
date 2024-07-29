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

interface Tab {
	_id: string;
	sessionId: string;
	date: string;
	favIconUrl?: string;
	id?: number;
	incognito: boolean;
	index: number;
	lastAccessed?: number;
	openerTabId?: number;
	pinned: boolean;
	browserSessionId: string;
	title?: string;
	url?: string;
	windowId: number;
}

interface GroupedTabRecords {
	[windowId: string]: Tab[];
}

export interface GroupedTabData {
	[date: string]: GroupedTabRecords;
}

export interface TabData {
	data: GroupedTabData;
	hasMore: boolean;
	lastDate: string;
	len: number;
}

export interface ApiResponse<T> {
	data: T;
}
