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
	useToast,
	Input,
	Label
} from "ui";
import { getBookmarks, deleteBookmark, updateBookmark } from "@/api/bookmarks";
import { PageLayout } from "@/components/Layout";
import { Bookmark, Session } from "@/types/api";
import { BookmarkList } from "@/components/BookmarkList";
import { getSessions } from "@/api/sessions";
import clsx from "clsx";

export function Bookmarks() {
	const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
	const [sessions, setSessions] = useState<Session[]>([]);
	const [currentFolder, setCurrentFolder] = useState<Bookmark | null>(null);
	const [path, setPath] = useState<Bookmark[]>([]);
	const [bookmarkToDelete, setBookmarkToDelete] = useState<Bookmark | null>(null);
	const [bookmarkToEdit, setBookmarkToEdit] = useState<Bookmark | null>(null);
	const [title, setTitle] = useState<string | undefined>();
	const [url, setUrl] = useState<string | undefined>();
	const [error, setError] = useState<string | undefined>();
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

	function editBookmark(bookmark: Bookmark) {
		setBookmarkToEdit(bookmark);
		setTitle(bookmark.title);
		setUrl(bookmark.url);
	}

	function closeEditBookmark(e: React.MouseEvent<HTMLButtonElement>) {
		setBookmarkToEdit(null);
		setTitle("");
		setUrl("");
		setError(undefined);
	}

	const ensureProtocol = (url: string) => {
		// Regular expression to match supported protocols with //
		const protocolPattern = /^(https?|file|chrome|edge):\/\//i;
		// Additional check for Firefox specific URLs
		const firefoxProtocolPattern = /^about:/i;

		// Check if the URL starts with any of the allowed protocols
		if (protocolPattern.test(url) || firefoxProtocolPattern.test(url)) {
			return url;
		}
		// If no protocol is found, default to http://
		return `http://${url}`;
	};

	function saveChanges() {
		if (bookmarkToEdit) {
			// Validate URL, exclude folders
			let formattedUrl = undefined;
			if (bookmarkToEdit.url) {
				if (!url) {
					setError("Invalid URL");
					return;
				}
				formattedUrl = ensureProtocol(url);
			}

			updateBookmark(bookmarkToEdit.id, bookmarkToEdit.sessionId, title + "", formattedUrl).then(
				(updated: number) => {
					if (updated > 0) {
						toast({
							title: "Updated",
							description: "Bookmark successfully updated"
						});
						setBookmarkToEdit(null);
						fetchData();
					} else {
						toast({
							title: "Something went wrong",
							description: "Could not update the bookmark. Please try again later."
						});
						setBookmarkToEdit(null);
					}
				}
			);
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
				setBookmarkToEdit={editBookmark}
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

			<AlertDialog open={!!bookmarkToEdit}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Edit bookmark</AlertDialogTitle>
						<AlertDialogDescription>
							<form>
								<div className="my-4 flex flex-col gap-y-2">
									<Label>Title</Label>
									<Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
								</div>
								{bookmarkToEdit && bookmarkToEdit.url && (
									<div className="my-4">
										<Label>Url</Label>
										<Input
											type="url"
											value={url}
											onChange={(e) => setUrl(e.target.value)}
											className={clsx("mt-2", error ? "border-red-800" : null)}
										/>
										{error && <span className="text-red-800">{error}</span>}
									</div>
								)}
							</form>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={closeEditBookmark}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={saveChanges}>Save</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Toaster />
		</PageLayout>
	);
}
