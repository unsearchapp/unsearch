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
import { Bookmark } from "@/types/api";
import { BookmarkList } from "@/components/BookmarkList";

export function Bookmarks() {
	const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
	const [currentFolder, setCurrentFolder] = useState<Bookmark | null>(null);
	const [bookmarkToDelete, setBookmarkToDelete] = useState<Bookmark | null>(null);
	const [openDialog, setOpenDialog] = useState<boolean>(false);
	const { toast } = useToast();

	function fetchData() {
		getBookmarks().then((data) => {
			setBookmarks(data);
		});
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

	return (
		<PageLayout>
			<div className="flex items-center">
				<h1 className="text-lg font-semibold md:text-2xl">Bookmarks</h1>
			</div>

			<BookmarkList
				bookmarks={bookmarks}
				currentFolder={currentFolder}
				setCurrentFolder={setCurrentFolder}
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
