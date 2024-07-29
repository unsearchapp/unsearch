import React, { useEffect, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Table,
	TableBody,
	TableCell,
	TableRow
} from "ui";
import { getTabs } from "@/api/tabs";
import { PageLayout } from "@/components/Layout";
import { GroupedTabData } from "@/types/api";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import InfiniteScroll from "react-infinite-scroll-component";

export function Tabs() {
	const [tabs, setTabs] = useState<GroupedTabData | null>(null);
	const [lastDate, setLastDate] = useState<string>("");
	const [lenItems, setLenItems] = useState<number>(0);
	const [hasMore, setHasMore] = useState<boolean>(true);

	async function fetchData() {
		try {
			getTabs(lastDate).then(({ data, lastDate, hasMore, len }) => {
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
		fetchData();
	}, []);

	return (
		<PageLayout>
			<div className="flex items-center">
				<h1 className="text-lg font-semibold md:text-2xl">Tabs</h1>
			</div>

			<InfiniteScroll dataLength={lenItems} next={fetchData} hasMore={hasMore} loader={"Loading"}>
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
		</PageLayout>
	);
}
