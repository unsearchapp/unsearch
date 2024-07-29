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
import { BookmarkItem } from "./BookmarkItem";
import { Bookmark } from "../types/api";

interface BookmarkListProps {
	bookmarks: Bookmark[];
	currentFolder: Bookmark | null;
	setCurrentFolder: (bookmark: Bookmark) => void;
	onDelete: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, bookmark: Bookmark) => void;
	path: Bookmark[];
	updatePath: (bookmark: Bookmark | null) => void;
}

export const BookmarkList: React.FC<BookmarkListProps> = ({
	bookmarks,
	currentFolder,
	setCurrentFolder,
	onDelete,
	path,
	updatePath
}) => {
	// Filter bookmarks to only show the ones in the current folder
	const filteredBookmarks = bookmarks.filter((bookmark) =>
		currentFolder ? bookmark.parentId === currentFolder.id : !bookmark.parentId
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
