import React from "react";
import clsx from "clsx";
import {
	TableCell,
	TableRow,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "ui";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { Bookmark, Session } from "@/types/api";
import { FIREFOX_SYS_BOOKMARKS_IDS, CHROMIUM_BOOKMARKS_IDS } from "@/utils/constants";

interface BookmarkItemProps {
	bookmark: Bookmark;
	session: Session | undefined;
	setCurrentFolder: (bookmark: Bookmark) => void;
	onDelete: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, bookmark: Bookmark) => void;
	showDropdown: boolean;
	onEdit: (bookmark: Bookmark) => void;
	onMove: (bookmark: Bookmark) => void;
}

export const BookmarkItem: React.FC<BookmarkItemProps> = ({
	bookmark,
	session,
	setCurrentFolder,
	onDelete,
	showDropdown,
	onEdit,
	onMove
}) => {
	const handleDoubleClick = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
		if (bookmark.url) {
			window.open(bookmark.url, "_blank");
		} else {
			setCurrentFolder(bookmark);
		}
	};

	const isSystemFolder =
		FIREFOX_SYS_BOOKMARKS_IDS.includes(bookmark.id) ||
		CHROMIUM_BOOKMARKS_IDS.includes(bookmark.id) ||
		bookmark.title === "Deleted favorites"; // Edge temporal folder

	return (
		<TableRow onDoubleClick={handleDoubleClick} className="cursor-pointer">
			<TableCell className={clsx("flex gap-x-2 font-medium", bookmark.url ? "flex-col" : null)}>
				{!bookmark.url && (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="w-5"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
						/>
					</svg>
				)}
				{!bookmark.parentId ? (
					session ? (
						<div className="flex gap-x-2 font-medium">
							<span className="capitalize">{session.browser}</span>
							<span className="text-gray-400">
								{session.os}, {session.arch}
							</span>
						</div>
					) : (
						"Root"
					)
				) : (
					bookmark.title
				)}
				<p className="truncate font-normal text-gray-500">{bookmark.url}</p>
			</TableCell>
			<TableCell className="text-right">
				{!isSystemFolder && (
					<DropdownMenu>
						<DropdownMenuTrigger>
							<DotsVerticalIcon />
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={(e) => onEdit(bookmark)}>Edit</DropdownMenuItem>
							<DropdownMenuItem onClick={(e) => onMove(bookmark!)}>Move</DropdownMenuItem>
							{showDropdown && (
								<DropdownMenuItem onClick={(e) => onDelete(e, bookmark)}>Delete</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</TableCell>
		</TableRow>
	);
};
