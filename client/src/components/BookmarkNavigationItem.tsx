import React from "react";
import clsx from "clsx";
import { TableCell, TableRow } from "ui";
import { Bookmark, Session } from "@/types/api";

interface BookmarkItemProps {
	bookmark: Bookmark;
	session: Session | undefined;
	setCurrentFolder: (bookmark: Bookmark) => void;
	hasChildrenFolders: boolean;
	setTargetFolder: (bookmark: Bookmark) => void;
	targetFolder: Bookmark | null;
}

export const BookmarkNavigationItem: React.FC<BookmarkItemProps> = ({
	bookmark,
	session,
	setCurrentFolder,
	hasChildrenFolders,
	targetFolder,
	setTargetFolder
}) => {
	const handleDoubleClick = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
		if (hasChildrenFolders) {
			setCurrentFolder(bookmark);
		}
	};

	return (
		<TableRow
			onDoubleClick={handleDoubleClick}
			onClick={() => setTargetFolder(bookmark)}
			className={clsx(
				"cursor-pointer",
				targetFolder === bookmark ? "bg-primary text-white hover:bg-primary" : null
			)}
		>
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
		</TableRow>
	);
};
