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
import {
	getBookmarks,
	deleteBookmark,
	updateBookmark,
	moveBookmark,
	createBookmark
} from "@/api/bookmarks";
import { CreateFolderModal } from "@/components/CreateFolderModal";
import { PageLayout } from "@/components/Layout";
import { Bookmark, Session } from "@/types/api";
import { BookmarkList } from "@/components/BookmarkList";
import { BookmarkNavigationList } from "@/components/BookmarkNavigationList";
import { getSessions } from "@/api/sessions";
import clsx from "clsx";

export function Bookmarks() {
	const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
	const [sessions, setSessions] = useState<Session[]>([]);
	const [currentFolder, setCurrentFolder] = useState<Bookmark | null>(null);
	const [path, setPath] = useState<Bookmark[]>([]);
	const [bookmarkToDelete, setBookmarkToDelete] = useState<Bookmark | null>(null);
	const [bookmarkToEdit, setBookmarkToEdit] = useState<Bookmark | null>(null);
	const [bookmarkToMove, setBookmarkToMove] = useState<Bookmark | null>(null);
	const [operation, setOperation] = useState<"copy" | "move" | "">("");
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

	function closeMoveBookmark() {
		setBookmarkToMove(null);
		setTargetFolder(null);
		setPathNavigation([]);
		setCurrentFolderNavigation(null);
	}

	// Folder navigation
	const [currentFolderNavigation, setCurrentFolderNavigation] = useState<Bookmark | null>(null);
	const [pathNavigation, setPathNavigation] = useState<Bookmark[]>([]);
	const [targetFolder, setTargetFolder] = useState<Bookmark | null>(null);

	function selectTargetFolder(bookmark: Bookmark) {
		if (bookmark.id !== "root________" && bookmark.id !== "0") {
			// Root folders can't be updated
			setTargetFolder(bookmark);
		}
	}

	function updateCurrentFolderNavigation(bookmark: Bookmark) {
		setCurrentFolderNavigation(bookmark);
		setPathNavigation((prevBookmarks) => [...prevBookmarks, bookmark]);
	}

	function updatePathNavigation(bookmark: Bookmark | null) {
		if (bookmark) {
			setCurrentFolderNavigation(bookmark);
			const pathIndex = path.findIndex((item) => item._id === bookmark._id);

			if (pathIndex !== -1) {
				setPathNavigation(path.slice(0, pathIndex + 1));
			}
		} else {
			// Return to all bookmarks view
			setCurrentFolderNavigation(null);
			setPathNavigation([]);
		}
	}

	function saveMove() {
		if (bookmarkToMove && targetFolder) {
			// Put bookmark at the end of the folder
			const siblings = bookmarks.filter((bookmark) => bookmark.parentId === targetFolder.id);

			let largestIndex;
			if (siblings.length > 0) {
				largestIndex = Math.max(...siblings.map((s) => (s.index ? s.index : -1)));
			} else {
				largestIndex = -1;
			}

			const index = largestIndex + 1;

			if (operation === "copy") {
				console.log(targetFolder.sessionId);
				createBookmark(
					targetFolder.id,
					targetFolder.sessionId,
					bookmarkToMove.title,
					index,
					bookmarkToMove.url
				).then((success) => {
					setBookmarkToMove(null);
					setCurrentFolderNavigation(null);
					setPathNavigation([]);
					setTargetFolder(null);
					if (success) {
						toast({
							title: "Copied",
							description: "Bookmark successfully copied"
						});
						fetchData();
					} else {
						toast({
							title: "Something went wrong",
							description: "Could not copy the bookmark. Please try again later."
						});
					}
				});
			} else {
				moveBookmark(bookmarkToMove.id, bookmarkToMove.sessionId, index, targetFolder.id).then(
					(updated: number) => {
						if (updated > 0) {
							toast({
								title: "Updated",
								description: "Bookmark successfully moved"
							});
							setBookmarkToMove(null);
							setCurrentFolderNavigation(null);
							setPathNavigation([]);
							setTargetFolder(null);
							fetchData();
						} else {
							toast({
								title: "Something went wrong",
								description: "Could not move the bookmark. Please try again later."
							});
							setBookmarkToMove(null);
							setCurrentFolderNavigation(null);
							setPathNavigation([]);
							setTargetFolder(null);
						}
					}
				);
			}
		}
	}

	const [folderName, setFolderName] = useState<string>("");
	const [openCreateFolderModal, setOpenCreateFolderModal] = useState<boolean>(false);
	const [folderParent, setFolderParent] = useState<Bookmark | null>(null);
	const [newFolderError, setNewFolderError] = useState<string>("");

	function createFolder(bookmark: Bookmark) {
		setFolderParent(bookmark);
		setOpenCreateFolderModal(true);
	}

	function createNewFolder() {
		// Create a folder as a child of the bookmark argument
		setNewFolderError("");
		if (!folderName) {
			setNewFolderError("Invalid name");
		} else {
			createBookmark(folderParent!.id, folderParent!.sessionId, folderName).then((success) => {
				if (success) {
					toast({
						title: "Created",
						description: "Folder successfully created"
					});
					fetchData();
				} else {
					toast({
						title: "Something went wrong",
						description: "Could not move the bookmark. Please try again later."
					});
				}
				setOpenCreateFolderModal(false);
				setFolderParent(null);
				setFolderName("");
			});
		}
	}

	function closeNewFolderModal() {
		setOpenCreateFolderModal(false);
		setNewFolderError("");
		setFolderName("");
	}

	function selectBookmarkOperation(bookmark: Bookmark, operationType: "copy" | "move") {
		setBookmarkToMove(bookmark);
		setOperation(operationType);
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
				setBookmarkToMove={selectBookmarkOperation}
				createFolder={createFolder}
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

			<AlertDialog open={!!bookmarkToMove}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{operation === "move" ? "Move" : "Copy"} bookmark</AlertDialogTitle>
						<AlertDialogDescription>
							<BookmarkNavigationList
								bookmarks={bookmarks}
								sessions={sessions}
								currentFolder={currentFolderNavigation}
								setCurrentFolder={updateCurrentFolderNavigation}
								path={pathNavigation}
								updatePath={updatePathNavigation}
								targetFolder={targetFolder}
								setTargetFolder={selectTargetFolder}
							/>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={closeMoveBookmark}>Cancel</AlertDialogCancel>
						{targetFolder ? (
							<AlertDialogAction onClick={saveMove}>
								{operation === "move" ? "Move" : "Copy"} bookmark
							</AlertDialogAction>
						) : (
							<AlertDialogCancel>
								{operation === "move" ? "Move" : "Copy"} bookmark
							</AlertDialogCancel>
						)}
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<CreateFolderModal
				open={openCreateFolderModal}
				onClose={closeNewFolderModal}
				name={folderName}
				setName={setFolderName}
				onCreate={createNewFolder}
				error={newFolderError}
			/>

			<Toaster />
		</PageLayout>
	);
}
