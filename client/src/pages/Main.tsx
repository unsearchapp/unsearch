import React, { useEffect, useState } from "react";
import { columns } from "@/components/columns";
import { DataTable } from "@/components/dataTable";
import { HistoryItem } from "@/types/api";
import { getHistoryItems } from "@/api/historyItems";
import { MagnifyingGlassIcon, ReloadIcon } from "@radix-ui/react-icons";
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
	MultiSelect
} from "ui";
import { getSessions } from "@/api/sessions";

export const Main = () => {
	const [query, setQuery] = useState<string>("");
	const [data, setData] = useState<HistoryItem[]>([]);
	const [sessions, setSessions] = useState<{ value: string; label: string; icon: string }[]>([]);
	const [searchType, setSearchType] = useState<string>("exact");
	const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
	const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

	const fetchData = async () => {
		setLoadingSearch(true);
		await getHistoryItems(query, searchType, selectedSessions).then((data) => setData(data));
		setLoadingSearch(false);
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

	useEffect(() => {
		if (searchType !== "semantic") {
			// Exclude live search as you type for semantic search as it is heavier rn
			fetchData();
		}
	}, [query]);

	return (
		<PageLayout>
			<div className="flex items-center">
				<h1 className="text-lg font-semibold md:text-2xl">Browsing history</h1>
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

					<Button onClick={fetchData} disabled={loadingSearch}>
						{loadingSearch && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
						Search
					</Button>
				</div>

				<DataTable columns={columns} data={data} />
			</div>
		</PageLayout>
	);
};
