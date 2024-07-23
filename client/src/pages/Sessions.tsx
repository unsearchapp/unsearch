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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "ui";
import { getSessions } from "@/api/sessions";
import { PageLayout } from "@/components/Layout";
import { Session } from "@/types/api";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { deleteSession } from "@/api/sessions";

export function Sessions() {
	const [sessions, setSessions] = useState<Session[] | null>(null);
	const [delSessionId, setDelSessionId] = useState<string | null>(null);
	const [openDialog, setOpenDialog] = useState<boolean>(false);
	const { toast } = useToast();

	function fetchData() {
		getSessions().then((data) => {
			setSessions(data);
		});
	}

	useEffect(() => {
		fetchData();
	}, []);

	function deleteAction(e: any, _id: string) {
		setDelSessionId(_id);
		setOpenDialog(true);
	}

	function deleteHandler(e: any) {
		if (delSessionId) {
			deleteSession(delSessionId).then((deleted: number) => {
				if (deleted > 0) {
					toast({
						title: "Deleted",
						description: "Session successfully deleted"
					});

					setOpenDialog(false);
					setDelSessionId(null);
					fetchData();
				}
			});
		}
	}

	return (
		<PageLayout>
			<div className="flex items-center">
				<h1 className="text-lg font-semibold md:text-2xl">Sessions</h1>
			</div>

			<Table className="mt-8">
				<TableHeader>
					<TableRow>
						<TableHead className="w-[100px]">Browser</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sessions &&
						sessions.map((session) => {
							return (
								<TableRow>
									<TableCell className="flex gap-x-2 font-medium">
										<img src={`./${session.browser}.svg`} className="w-5" />
										{session.browser}
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger>
												<DotsVerticalIcon />
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuSeparator />
												<DropdownMenuItem onClick={(e) => deleteAction(e, session._id)}>
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							);
						})}
				</TableBody>
			</Table>

			<AlertDialog open={openDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete session</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the session and remove all
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
