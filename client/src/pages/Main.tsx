import React, { useEffect, useState, useRef } from "react";
import { HistoryItem, HistoryResponse } from "@/types/api";
import { getHistoryItems, exportHistoryItems, deleteHistoryItems } from "@/api/historyItems";
import { MagnifyingGlassIcon, ReloadIcon, Cross1Icon } from "@radix-ui/react-icons";
import { PageLayout } from "@/components/Layout";
import {
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Label,
	Button,
	MultiSelect,
	Toaster,
	useToast,
	Table,
	TableBody,
	TableCell,
	TableRow,
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Checkbox
} from "ui";
import { getSessions } from "@/api/sessions";
import InfiniteScroll from "react-infinite-scroll-component";

export const Main = () => {
	const [query, setQuery] = useState<string>("");
	const [data, setData] = useState<HistoryItem[]>([]);
	const [page, setPage] = useState<number>(1);
	const [totalItems, setTotalItems] = useState<number>(0);
	const [lenItems, setLenItems] = useState<number>(0);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const [sessions, setSessions] = useState<{ value: string; label: string; icon: string }[]>([]);
	const [searchType, setSearchType] = useState<string>("exact");
	const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
	const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
	const [exportLoading, setExportLoading] = useState<boolean>(false);
	const { toast } = useToast();
	const fetchingRef = useRef(false);
	const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
	const [deleteType, setDeleteType] = useState<"deleteAll" | "deleteSelected" | null>(null);
	const pageSize = 25;

	const fetchData = (reset: boolean = false) => {
		if (!reset && (fetchingRef.current || !hasMore)) return; // Avoid multiple request on StrictMode
		fetchingRef.current = true;

		setLoadingSearch(true);
		try {
			getHistoryItems(query, searchType, selectedSessions, page).then(
				(response: HistoryResponse) => {
					if (reset) {
						// Reset data
						setData(response.items);
						setPage(2);
					} else {
						// Append data
						setData((prevItems) => [...prevItems, ...response.items]);
						setPage((prevPage) => prevPage + 1);
					}

					setTotalItems(response.totalItems);
					setLenItems((prevLen) =>
						reset ? response.items.length : prevLen + response.items.length
					);
					setHasMore(response.items.length === pageSize);
				}
			);
		} finally {
			setLoadingSearch(false);
			fetchingRef.current = false;
		}
	};

	useEffect(() => {
		getSessions().then((sessions) => {
			const updatedSessions = sessions.map((session) => ({
				value: session._id,
				label: session.browser.charAt(0).toUpperCase() + session.browser.slice(1),
				icon: `./${session.browser}.svg`
			}));
			setSessions(updatedSessions);
		});
	}, []);

	const isFirstRender = useRef(true);

	useEffect(() => {
		if (isFirstRender.current) {
			// Skip the effect on the first render
			isFirstRender.current = false;
			fetchData();
		} else {
			// Only run this on subsequent updates to `query` or `searchType`
			if (searchType !== "semantic") {
				fetchData(true);
			}
		}
	}, [query]);

	async function handleExport() {
		try {
			setExportLoading(true);
			await exportHistoryItems();
		} catch (error) {
			toast({
				title: "Something went wrong",
				description: "Could not export history. Please try again later."
			});
		} finally {
			setExportLoading(false);
		}
	}

	const handleSelectItem = (itemId: string, isSelected: boolean) => {
		if (isSelected) {
			setSelectedItems((prev) => new Set(prev).add(itemId));
		} else {
			setSelectedItems((prev) => {
				const newSet = new Set(prev);
				newSet.delete(itemId);
				return newSet;
			});
		}
	};

	const handleDeleteConfirm = async () => {
		try {
			const deleteAll = deleteType === "deleteAll";
			const ids = deleteAll ? [] : Array.from(selectedItems);

			const deletedRows = await deleteHistoryItems(deleteAll, ids);

			const toastMessage =
				deletedRows > 0
					? { title: "Deleted", description: "History successfully deleted" }
					: {
							title: "Something went wrong",
							description: "Could not remove history. Please try again later."
						};

			toast(toastMessage);

			if (deletedRows > 0) {
				// window.location.reload();
				fetchData(true);
				setSelectedItems(new Set());
			}
		} catch (error) {
			toast({
				title: "Something went wrong",
				description: "Could not remove history. Please try again later."
			});
		} finally {
			setDeleteType(null);
		}
	};

	const handleOpenDialog = (type: "deleteAll" | "deleteSelected") => {
		setDeleteType(type);
	};

	return (
		<PageLayout>
			{selectedItems.size > 0 && (
				<div className="fixed left-1/2 top-8 z-10 flex w-fit -translate-x-1/2 transform flex-col items-center space-y-2 rounded-lg bg-muted p-2 shadow-lg">
					<div className="flex items-center space-x-8">
						<Button variant="secondary" size="icon" onClick={() => setSelectedItems(new Set())}>
							<Cross1Icon className="w-6" />
						</Button>
						<span>
							{selectedItems.size}/{totalItems} item(s) selected
						</span>
						<div className="flex gap-x-4">
							<Button variant="destructive" onClick={() => handleOpenDialog("deleteSelected")}>
								Delete
							</Button>
							<Button variant="destructive" onClick={() => handleOpenDialog("deleteAll")}>
								Delete all
							</Button>
						</div>
					</div>
				</div>
			)}

			<div className="flex items-center justify-between">
				<h1 className="text-lg font-semibold md:text-2xl">Browsing history</h1>
				<Button variant="secondary" onClick={handleExport} disabled={exportLoading}>
					{exportLoading ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : null}
					Export history
				</Button>
			</div>
			<div>
				<div className="mb-6 flex items-end gap-x-4">
					<div className="relative md:w-2/3 lg:w-1/3">
						<MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							onChange={(e) => setQuery(e.target.value)}
							value={query}
							placeholder="Search"
							className="w-full appearance-none bg-background pl-8 shadow-none"
						/>
					</div>
					<div>
						<Label className="text-muted-foreground">Type of search</Label>
						<Select onValueChange={setSearchType} value={searchType}>
							<SelectTrigger className="w-[180px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="exact">Exact</SelectItem>
								<SelectItem value="fuzzy">Fuzzy</SelectItem>
								<SelectItem value="semantic">Semantic</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label className="text-muted-foreground">Sessions</Label>
						<MultiSelect
							options={sessions}
							onValueChange={setSelectedSessions}
							defaultValue={selectedSessions}
							placeholder="Filter by sessions"
							variant="inverted"
							maxCount={3}
						/>
					</div>

					<Button onClick={() => fetchData(true)} disabled={loadingSearch}>
						{loadingSearch && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
						Search
					</Button>
				</div>

				<InfiniteScroll dataLength={lenItems} next={fetchData} hasMore={hasMore} loader={"Loading"}>
					<Table className="my-2 border">
						<TableBody>
							{data.map((item) => (
								<TableRow
									className="cursor-pointer"
									key={item._id}
									onDoubleClick={() => window.open(item.url, "_blank")}
								>
									<TableCell>
										<Checkbox
											checked={selectedItems.has(item._id)}
											onCheckedChange={(isSelected) => handleSelectItem(item._id, isSelected)}
											aria-label="Select row"
										/>
									</TableCell>
									<TableCell>
										<div className="max-w-md">
											<div className="font--bold truncate whitespace-nowrap">{item.title}</div>
											<div className="truncate text-gray-400">{item.url}</div>
										</div>
									</TableCell>
									<TableCell>
										{item.lastVisitTime ? new Date(item.lastVisitTime).toLocaleString() : null}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</InfiniteScroll>
			</div>

			<AlertDialog open={!!deleteType}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete history</AlertDialogTitle>
						<AlertDialogDescription>
							{deleteType === "deleteAll"
								? `Are you sure you want to delete all ${totalItems} item(s)?`
								: `Are you sure you want to delete ${selectedItems.size} selected item(s)?`}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={(e) => setDeleteType(null)}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Toaster />
		</PageLayout>
	);
};
