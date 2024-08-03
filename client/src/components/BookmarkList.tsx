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
	BreadcrumbSeparator,
	Button
} from "ui";
import { BookmarkItem } from "./BookmarkItem";
import { Bookmark, Session } from "../types/api";

interface BookmarkListProps {
	bookmarks: Bookmark[];
	sessions: Session[];
	currentFolder: Bookmark | null;
	setCurrentFolder: (bookmark: Bookmark) => void;
	onDelete: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, bookmark: Bookmark) => void;
	path: Bookmark[];
	updatePath: (bookmark: Bookmark | null) => void;
	setBookmarkToEdit: (bookmark: Bookmark) => void;
	setBookmarkToMove: (bookmark: Bookmark, operationType: "copy" | "move") => void;
	createFolder: (bookmark: Bookmark) => void;
}

export const BookmarkList: React.FC<BookmarkListProps> = ({
	bookmarks,
	sessions,
	currentFolder,
	setCurrentFolder,
	onDelete,
	path,
	updatePath,
	setBookmarkToEdit,
	setBookmarkToMove,
	createFolder
}) => {
	// Filter bookmarks to only show the ones in the current folder & in the same session as the current folder
	const filteredBookmarks = bookmarks.filter((bookmark) =>
		currentFolder
			? bookmark.parentId === currentFolder.id && bookmark.sessionId === currentFolder.sessionId
			: !bookmark.parentId
	);

	// Set option to create folder if it isn't a root folder
	const canCreateFolder =
		currentFolder && currentFolder.id !== "0" && currentFolder.id !== "root________";

	return (
		<div>
			<div className="flex items-center justify-between">
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
				{canCreateFolder && <Button onClick={() => createFolder(currentFolder)}>New folder</Button>}
			</div>

			<Table className="mt-8">
				<TableHeader>
					<TableRow>
						<TableHead>Bookmark</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredBookmarks.map((bookmark) => {
						const hasChildren = bookmark.url
							? false
							: bookmarks.some((child) => child.parentId === bookmark.id); // skip root folder

						// Show delete in dropdown on bookmarks and empty folders
						const showDropdown = Boolean(bookmark.url) || !hasChildren;

						return (
							<BookmarkItem
								key={bookmark._id}
								session={sessions.find((session) => session._id === bookmark.sessionId)}
								bookmark={bookmark}
								setCurrentFolder={setCurrentFolder}
								onDelete={onDelete}
								showDropdown={showDropdown}
								onEdit={setBookmarkToEdit}
								onMove={setBookmarkToMove}
							/>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
};

export default BookmarkList;
