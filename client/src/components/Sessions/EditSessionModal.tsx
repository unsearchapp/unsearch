import React, { useState, Dispatch, SetStateAction, useEffect } from "react";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogCancel,
	AlertDialogHeader,
	AlertDialogDescription,
	Label,
	Input,
	AlertDialogTitle,
	AlertDialogAction,
	AlertDialogFooter,
	useToast
} from "ui";
import { Session } from "@/types/api";
import { editSession } from "@/api/sessions";

interface EditSessionModalProps {
	session: Session | null;
	setSession: Dispatch<SetStateAction<Session | null>>;
	onSuccess: () => void;
}

export const EditSessionModal: React.FC<EditSessionModalProps> = ({
	session,
	setSession,
	onSuccess
}) => {
	const { toast } = useToast();
	const [name, setName] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");

	const onEdit = async () => {
		setErrorMessage("");

		if (!name) {
			setErrorMessage("Invalid name");
			return;
		}

		try {
			if (session) {
				const success = await editSession(session._id, name);

				if (success === 1) {
					toast({
						title: "Updated",
						description: "Session successfully updated."
					});
					onSuccess();
				} else {
					toast({
						title: "Something went wrong",
						description: "Could not update the session. Please try again later."
					});
				}
			} else {
				throw Error;
			}
		} catch {
			toast({
				title: "Something went wrong",
				description: "Could not update the session. Please try again later."
			});
		} finally {
			setSession(null);
		}
	};

	useEffect(() => {
		setName(session ? session.name : "");
	}, [session]);

	const onClose = (e: React.MouseEvent<HTMLButtonElement>) => {
		setSession(null);
		setErrorMessage("");
	};

	return (
		<AlertDialog open={!!session}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Edit session</AlertDialogTitle>
					<AlertDialogDescription>
						<Label>Name</Label>
						<Input value={name} onChange={(e) => setName(e.target.value)} className="my-2" />
						{errorMessage && <span className="text-sm font-bold text-red-600">{errorMessage}</span>}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={onEdit}>Save</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
