import React from "react";
import { Button, Table, TableBody, TableHead, TableHeader, TableRow } from "ui";
import { BookmarkItem } from "./BookmarkItem";
import { Bookmark } from "../types/api";

interface BookmarkListProps {
	bookmarks: Bookmark[];
	currentFolder: Bookmark | null;
	setCurrentFolder: React.Dispatch<React.SetStateAction<Bookmark | null>>;
	onDelete: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, bookmark: Bookmark) => void;
}

export const BookmarkList: React.FC<BookmarkListProps> = ({
	bookmarks,
	currentFolder,
	setCurrentFolder,
	onDelete
}) => {
	// Filter bookmarks to only show the ones in the current folder
	const filteredBookmarks = bookmarks.filter((bookmark) =>
		currentFolder ? bookmark.parentId === currentFolder.id : !bookmark.parentId
	);

	return (
		<div>
			{currentFolder && <Button onClick={() => setCurrentFolder(null)}>Back</Button>}

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
						const showDropdown =
							Boolean(bookmark.url) ||
							(!bookmark.url && !hasChildren && Boolean(bookmark.parentId)); // Show delete in dropdown on bookmarks and empty folders

						return (
							<BookmarkItem
								key={bookmark._id}
								bookmark={bookmark}
								setCurrentFolder={setCurrentFolder}
								onDelete={onDelete}
								showDropdown={showDropdown}
							/>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
};

export default BookmarkList;
