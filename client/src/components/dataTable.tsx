import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
	Row
} from "@tanstack/react-table";
import { deleteHistoryItems } from "@/api/historyItems";
import { HistoryItem } from "@/types/api";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "ui";

import React from "react";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
	const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 25 }); // Set initial pagination

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		state: {
			pagination
		}
	});

	function onDeleteSelected(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
		const selectedRows = table.getFilteredSelectedRowModel().rows as Row<HistoryItem>[];

		const deleteAll = false;
		const ids = selectedRows.map((row) => row.original._id);

		deleteHistoryItems(deleteAll, ids);
		window.location.reload();
	}

	function handleDoubleClick(row: Row<TData>) {
		window.open(row.original.url, "_blank");
	}

	return (
		<div>
			<div className="rounded-md border">
				<div className="flex-1 text-sm text-muted-foreground">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
					{table.getFilteredSelectedRowModel().rows.length > 0 && (
						<Button onClick={onDeleteSelected}>Delete</Button>
					)}
				</div>

				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id}>
												{header.isPlaceholder
													? null
													: flexRender(header.column.columnDef.header, header.getContext())}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => {
									return (
										<TableRow
											key={row.id}
											data-state={row.getIsSelected() && "selected"}
											onDoubleClick={() => handleDoubleClick(row)}
											className="cursor-pointer"
										>
											{row.getVisibleCells().map((cell) => (
												<TableCell key={cell.id}>
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</TableCell>
											))}
										</TableRow>
									);
								})
							) : (
								<TableRow>
									<TableCell colSpan={columns.length} className="h-24 text-center">
										No results.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
			<div className="flex items-center justify-end space-x-2 py-4">
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
