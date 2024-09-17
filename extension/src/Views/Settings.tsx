import logo from "@packages/assets/images/unsearch.png";
import { GearIcon, CheckIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import React, { Dispatch, SetStateAction, useState } from "react";
import { Button, Input, Label } from "ui";
import { sendMessageToBackground } from "../utils/utils";
import browser from "webextension-polyfill";

interface SettingsProps {
	setView: Dispatch<SetStateAction<"welcome" | "settings" | "home">>;
	port: browser.Runtime.Port | null;
	host: string;
	setHost: Dispatch<SetStateAction<string>>;
}

export const Settings: React.FC<SettingsProps> = ({ setView, port, host, setHost }) => {
	const [newHost, setNewHost] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setErrorMessage("");

		if (port) {
			const message = await sendMessageToBackground(port, { type: "HOST_UPDATE", host: newHost });
			if (message.status === "success") {
				setHost(message.host);
			} else if (message.status === "error") {
				setErrorMessage(message.error);
			} else {
				setErrorMessage("Something went wrong, please try again later.");
			}

			setNewHost("");
		}
	}

	return (
		<div className="flex h-[500px] w-[400px] p-4">
			<div className="w-full">
				<div className="flex w-full justify-between">
					<div className="mb-4 flex items-center gap-x-2 font-bold">
						<img src={logo} className="w-6" alt="Logo" />
						Unsearch
					</div>
					<a className="cursor-pointer" onClick={() => setView("welcome")}>
						<GearIcon className="w-6" />
					</a>
				</div>

				<div className="mt-8">
					<div className="max-w-full text-left">
						<h1 className="text-lg font-bold">Settings</h1>
						<div className="flex gap-x-1 text-sm">
							<strong>Host:</strong> <span>{host}</span>
							<CheckIcon className="my-auto w-6 font-bold text-green-600" />
							<span>Connected</span>
						</div>
					</div>

					<form className="mb-30 mt-8" onSubmit={handleSubmit}>
						<Label>Update host</Label>
						<Input
							value={newHost}
							onChange={(e) => setNewHost(e.target.value)}
							placeholder="domain.com"
						/>
						{errorMessage && (
							<span className="mt-2 flex items-center gap-x-2 text-sm font-bold text-red-600">
								<ExclamationTriangleIcon className="size-4" />
								{errorMessage}
							</span>
						)}
						<Button type="submit" variant={"default"} className="mt-4 w-full">
							Save
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
};
