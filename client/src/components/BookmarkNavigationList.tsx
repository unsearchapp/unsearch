import React from "react";
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbSeparator
} from "ui";
import { BookmarkNavigationItem } from "./BookmarkNavigationItem";
import { Bookmark, Session } from "../types/api";

interface BookmarkListProps {
	bookmarks: Bookmark[];
	sessions: Session[];
	currentFolder: Bookmark | null;
	setCurrentFolder: (bookmark: Bookmark) => void;
	path: Bookmark[];
	updatePath: (bookmark: Bookmark | null) => void;
	targetFolder: Bookmark | null;
	setTargetFolder: (bookmark: Bookmark) => void;
}

export const BookmarkNavigationList: React.FC<BookmarkListProps> = ({
	bookmarks,
	sessions,
	currentFolder,
	setCurrentFolder,
	path,
	updatePath,
	targetFolder,
	setTargetFolder
}) => {
	// Filter bookmarks to only show the ones in the current folder & in the same session as the current folder
	// Display only folders, not bookmarks
	const filteredBookmarks = bookmarks.filter((bookmark) =>
		currentFolder
			? bookmark.parentId === currentFolder.id &&
				bookmark.sessionId === currentFolder.sessionId &&
				!bookmark.url
			: !bookmark.parentId
	);

	return (
		<div>
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink className="hover:cursor-pointer" onClick={(e) => updatePath(null)}>
							All bookmarks
						</BreadcrumbLink>
					</BreadcrumbItem>
					{path.length > 0 ? <BreadcrumbSeparator /> : null}
					{path.map((bookmark, index) => (
						<>
							<BreadcrumbItem>
								<BreadcrumbLink
									className="hover:cursor-pointer"
									onClick={(e) => updatePath(bookmark)}
								>
									{bookmark.parentId ? bookmark.title : "Root folder"}
								</BreadcrumbLink>
							</BreadcrumbItem>
							{index < path.length - 1 ? <BreadcrumbSeparator /> : null}
						</>
					))}
				</BreadcrumbList>
			</Breadcrumb>

			<Table className="mt-8">
				<TableHeader>
					<TableRow>
						<TableHead>Bookmark</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredBookmarks.map((bookmark) => {
						const hasChildrenFolders = bookmarks.some(
							(child) => child.parentId === bookmark.id && !child.url
						); // skip root folder

						return (
							<BookmarkNavigationItem
								key={bookmark._id}
								session={sessions.find((session) => session._id === bookmark.sessionId)}
								bookmark={bookmark}
								setCurrentFolder={setCurrentFolder}
								hasChildrenFolders={hasChildrenFolders}
								targetFolder={targetFolder}
								setTargetFolder={setTargetFolder}
							/>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
};
