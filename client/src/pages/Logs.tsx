import React, { useEffect, useState, useRef } from "react";
import { Log } from "@/types/api";
import { PageLayout } from "@/components/Layout";
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from "ui";
import { getLogs } from "@/api/logs";
import InfiniteScroll from "react-infinite-scroll-component";
import { DotFilledIcon } from "@radix-ui/react-icons";
import clsx from "clsx";

export const Logs = () => {
	const [logs, setLogs] = useState<Log[]>([]);
	const [page, setPage] = useState<number>(1);
	const [lenItems, setLenItems] = useState<number>(0);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const fetchingRef = useRef(false);

	async function fetchData() {
		if (fetchingRef.current || !hasMore) return; // Avoid multiple request on StrictMode
		fetchingRef.current = true;

		try {
			const { data, hasMoreItems, len } = await getLogs(page);

			setLogs((prevLogs) => [...prevLogs, ...data]);
			setHasMore(hasMoreItems);
			setPage(page + 1);
			setLenItems((prevLen) => prevLen + len);
		} finally {
			fetchingRef.current = false;
		}
	}

	useEffect(() => {
		fetchData();
	}, []);

	return (
		<PageLayout>
			<div>
				<h1 className="text-lg font-semibold md:text-2xl">Logs</h1>
				<p className="mt-2 text-muted-foreground">
					Check all the messages sent to your connected browser extensions.
				</p>
			</div>
			<InfiniteScroll dataLength={lenItems} next={fetchData} hasMore={hasMore} loader={"Loading"}>
				<Table className="my-2 border">
					<TableHeader>
						<TableRow>
							<TableHead>Session</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Created</TableHead>
							<TableHead>Sent</TableHead>
							<TableHead>Message</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{logs.map((log) => (
							<TableRow className="cursor-pointer" key={log._id}>
								<TableCell>
									<span className="font-medium capitalize">{log.session.browser} </span>
									<span className="text-muted-foreground">
										{log.session.os}, {log.session.arch}
									</span>
								</TableCell>
								<TableCell className="items-center">
									<div className="flex">
										<DotFilledIcon
											className={clsx(
												"h-5 w-5",
												log.status === "pending" ? "text-yellow-500" : "text-green-500"
											)}
										/>
										<span className="capitalize">{log.status}</span>
									</div>
								</TableCell>
								<TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
								<TableCell>{log.sentAt ? new Date(log.sentAt).toLocaleString() : null}</TableCell>
								<TableCell className="max-w-md truncate text-muted-foreground">
									{log.msg_type}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</InfiniteScroll>
		</PageLayout>
	);
};
