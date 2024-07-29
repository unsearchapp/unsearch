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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Table,
	TableBody,
	TableCell,
	TableRow,
	Toaster,
	useToast
} from "ui";
import { getTabs, deleteTab } from "@/api/tabs";
import { PageLayout } from "@/components/Layout";
import { GroupedTabData } from "@/types/api";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import InfiniteScroll from "react-infinite-scroll-component";

export function Tabs() {
	const [tabs, setTabs] = useState<GroupedTabData | null>(null);
	const [lastDate, setLastDate] = useState<string>("");
	const [lenItems, setLenItems] = useState<number>(0);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const [delTabId, setDelTabId] = useState<string | null>(null);
	const [openDialog, setOpenDialog] = useState<boolean>(false);
	const { toast } = useToast();

	async function fetchData(date: string) {
		try {
			getTabs(date).then(({ data, lastDate, hasMore, len }) => {
				setHasMore(hasMore);
				if (lastDate) {
					setLastDate(lastDate);
				}

				setTabs((prevData) => ({
					...prevData,
					...data
				}));

				setLenItems((prevLen) => prevLen + len);
			});
		} catch (error) {}
	}

	useEffect(() => {
		fetchData(lastDate);
	}, []);

	function onDeleteSingleTab(e: React.MouseEvent<HTMLElement>, _id: string) {
		setDelTabId(_id);
		setOpenDialog(true);
	}

	function deleteHandler(e: React.MouseEvent<HTMLElement>) {
		if (delTabId) {
			deleteTab(delTabId).then((deleted: number) => {
				if (deleted > 0) {
					toast({
						title: "Deleted",
						description: "Tab successfully deleted"
					});

					setOpenDialog(false);
					setDelTabId(null);
					fetchData("");
				} else {
					toast({
						title: "Something went wrong",
						description: "Could not delete tab. Please try again later"
					});
					setOpenDialog(false);
					setDelTabId(null);
				}
			});
		}
	}

	return (
		<PageLayout>
			<div className="flex items-center">
				<h1 className="text-lg font-semibold md:text-2xl">Tabs</h1>
			</div>

			<InfiniteScroll dataLength={lenItems} next={() => fetchData(lastDate)} hasMore={hasMore} loader={"Loading"}>
				{tabs &&
					Object.keys(tabs).map((key, index) => (
						<>
							<div className="my-2 text-sm font-bold text-gray-400">
								{new Date(key).toLocaleString()} · {Object.keys(tabs[key]).length} window
								{Object.keys(tabs[key]).length > 1 ? "s" : null}
							</div>
							{Object.keys(tabs[key]).map((k, index) => (
								<Table className="my-2 border">
									<TableBody>
										{tabs[key][k].map((item) => (
											<TableRow
												className="cursor-pointer"
												onDoubleClick={() => window.open(item.url, "_blank")}
											>
												<TableCell className="flex max-w-md gap-x-2 font-medium">
													<img src={item.favIconUrl} className="my-auto h-5 w-5 rounded-md" />
													<div>
														<div className="font--bold truncate whitespace-nowrap">
															{item.title}
														</div>
														<div className="truncate text-gray-400">{item.url}</div>
													</div>
												</TableCell>
												<TableCell className="text-right">
													<DropdownMenu>
														<DropdownMenuTrigger>
															<DotsVerticalIcon />
														</DropdownMenuTrigger>
														<DropdownMenuContent>
															<DropdownMenuLabel>Actions</DropdownMenuLabel>
															<DropdownMenuSeparator />
															<DropdownMenuItem onClick={() => window.open(item.url, "_blank")}>
																Open
															</DropdownMenuItem>
															<DropdownMenuItem onClick={(e) => onDeleteSingleTab(e, item._id)}>
																Delete
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							))}
						</>
					))}
			</InfiniteScroll>

			<AlertDialog open={openDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete tab</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently remove the tab and all
							associated data.
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
