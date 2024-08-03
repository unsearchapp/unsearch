import React, { Dispatch, SetStateAction } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Label,
	Input
} from "ui";
import clsx from "clsx";

interface CreateFolderModalProps {
	open: boolean;
	onClose: () => void;
	name: string;
	setName: Dispatch<SetStateAction<string>>;
	onCreate: () => void;
	error: string;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
	open,
	onClose,
	name,
	setName,
	onCreate,
	error
}) => {
	return (
		<AlertDialog open={open}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Create folder</AlertDialogTitle>
					<AlertDialogDescription>
						<div className="my-4">
							<Label>Name</Label>
							<Input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className={clsx("mb-1 mt-2", error ? "border-red-800" : null)}
							/>
							{error && <span className="text-red-800">{error}</span>}
						</div>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={onCreate}>Create</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
