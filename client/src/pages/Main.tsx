import React, { useEffect, useState } from "react";
import { columns } from "@/components/columns";
import { DataTable } from "@/components/dataTable";
import { HistoryItem } from "@/types/api";
import { getHistoryItems } from "@/api/historyItems";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { PageLayout } from "@/components/Layout";
import { Input } from "ui";

export const Main = () => {
	const [query, setQuery] = useState<string>("");
	const [data, setData] = useState<HistoryItem[]>([]);
	const [searchType, setSearchType] = useState<string>("");

	useEffect(() => {
		const fetchData = () => {
			getHistoryItems(query, searchType).then((data) => setData(data));
		};
		fetchData();
	}, [query]);

	return (
		<PageLayout>
			<div className="flex items-center">
				<h1 className="text-lg font-semibold md:text-2xl">Browsing history</h1>
			</div>
			<div>
				<div className="relative mb-6">
					<MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						onChange={(e) => setQuery(e.target.value)}
						value={query}
						placeholder="Search"
						className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
					/>
				</div>
				<DataTable columns={columns} data={data} />
			</div>
		</PageLayout>
	);
};
