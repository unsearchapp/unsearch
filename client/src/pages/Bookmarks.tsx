import React, { useEffect, useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Toaster,
	useToast
} from "ui";
import { getBookmarks, deleteBookmark } from "@/api/bookmarks";
import { PageLayout } from "@/components/Layout";
import { Bookmark, Session } from "@/types/api";
import { BookmarkList } from "@/components/BookmarkList";
import { getSessions } from "@/api/sessions";

export function Bookmarks() {
	const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
	const [sessions, setSessions] = useState<Session[]>([]);
	const [currentFolder, setCurrentFolder] = useState<Bookmark | null>(null);
	const [path, setPath] = useState<Bookmark[]>([]);
	const [bookmarkToDelete, setBookmarkToDelete] = useState<Bookmark | null>(null);
	const [openDialog, setOpenDialog] = useState<boolean>(false);
	const { toast } = useToast();

	function fetchData() {
		getBookmarks().then((data) => setBookmarks(data));
		getSessions().then((sessions) => setSessions(sessions));
	}

	useEffect(() => {
		fetchData();
	}, []);

	function deleteAction(e: React.MouseEvent<HTMLDivElement, MouseEvent>, bookmark: Bookmark) {
		setBookmarkToDelete(bookmark);
		setOpenDialog(true);
	}

	function deleteHandler(e: any) {
		if (bookmarkToDelete) {
			deleteBookmark(bookmarkToDelete.id, bookmarkToDelete.sessionId).then((deleted: number) => {
				if (deleted > 0) {
					toast({
						title: "Deleted",
						description: "Bookmark successfully deleted"
					});
					setOpenDialog(false);
					setBookmarkToDelete(null);
					fetchData();
				}
			});
		}
	}

	function updateCurrentFolder(bookmark: Bookmark) {
		setCurrentFolder(bookmark);
		setPath((prevBookmarks) => [...prevBookmarks, bookmark]);
	}

	function updatePath(bookmark: Bookmark | null) {
		if (bookmark) {
			setCurrentFolder(bookmark);
			const pathIndex = path.findIndex((item) => item._id === bookmark._id);

			if (pathIndex !== -1) {
				setPath(path.slice(0, pathIndex + 1));
			}
		} else {
			// Return to all bookmarks view
			setCurrentFolder(null);
			setPath([]);
		}
	}

	return (
		<PageLayout>
			<div className="flex items-center">
				<h1 className="text-lg font-semibold md:text-2xl">Bookmarks</h1>
			</div>

			<BookmarkList
				bookmarks={bookmarks}
				sessions={sessions}
				currentFolder={currentFolder}
				setCurrentFolder={updateCurrentFolder}
				path={path}
				updatePath={updatePath}
				onDelete={deleteAction}
			/>

			<AlertDialog open={openDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete bookmark</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the bookmark from the
							browser.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={(e) => setOpenDialog(false)}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={deleteHandler}>Continue</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Toaster />
		</PageLayout>
	);
}
