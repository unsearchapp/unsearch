export interface AuthPayload {
	token: string;
}

export interface IdPayload {
	id: string;
	browser: string;
}

export interface HistoryAddPayload {
	id: string;
	url?: string;
	title?: string | null;
	lastVisitTime?: number;
	visitCount?: number;
	typedCount?: number;
}

export interface HistoryDeletePayload {
	allHistory: boolean;
	urls?: string[];
}

export interface BookmarkNodePayload {
	dateAdded?: number;
	dateGroupModified?: number;
	dateLastUsed?: number;
	id: string;
	index?: number;
	parentId?: string;
	title: string;
	url?: string;
}

export interface BookmarksTreeNodePayload extends BookmarkNodePayload {
	children?: BookmarksTreeNodePayload[];
}

export interface BookmarksAddPayload {
	bookmarks: BookmarksTreeNodePayload[];
}

export interface BookmarksDeletePayload {
	id: string;
}

export interface BookmarksUpdatePayload {
	id: string;
	updateInfo: {
		title: string;
		url: string;
	};
}

export interface BookmarksMovePayload {
	id: string;
	moveInfo: {
		index: string;
		oldIndex: string;
		oldParentId: string;
		parentId: string;
	};
}
