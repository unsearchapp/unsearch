import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "ui";
import { HistoryItem } from "@/types/api";

export const columns: ColumnDef<HistoryItem>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false
	},
	{
		accessorFn: (row) => ({ title: row.title, url: row.url }),
		header: "History",
		cell: ({ getValue }) => {
			const { title, url } = getValue() as { title: string; url: string };
			return (
				<div className="max-w-md">
					<div className="font--bold truncate whitespace-nowrap">{title}</div>
					<div className="truncate text-gray-400">{url}</div>
				</div>
			);
		}
	},
	{
		accessorKey: "lastVisitTime",
		header: "Time",
		cell: ({ getValue }) => {
			const formattedTime = new Date(getValue() as string).toLocaleString();
			return <div>{formattedTime}</div>;
		}
	}
];
