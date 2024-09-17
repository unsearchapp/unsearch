import logo from "@packages/assets/images/unsearch.png";
import { GearIcon } from "@radix-ui/react-icons";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import { buttonVariants } from "ui";
import browser from "webextension-polyfill";

interface WelcomeProps {
	setView: Dispatch<SetStateAction<"welcome" | "settings" | "home">>;
	port: browser.Runtime.Port | null;
	url: string;
	setUrl: Dispatch<SetStateAction<string>>;
	setHost: Dispatch<SetStateAction<string>>;
}

export const Welcome: React.FC<WelcomeProps> = ({ setView, url, setUrl, setHost }) => {
	const getUser = async () => {
		const result = await browser.storage.local.get("urls");
		setUrl(result.urls.webappUrl);

		const baseHost = await browser.storage.local.get("baseHost");
		setHost(baseHost.baseHost);
	};

	useEffect(() => {
		getUser();
	}, []);

	return (
		<div className="mx-auto flex h-[500px] w-[400px]">
			<div className="mx-auto p-4 text-center">
				<div className="flex justify-between">
					<div className="mb-4 flex items-center gap-x-2 font-bold">
						<img src={logo} className="w-6" alt="Logo" />
						Unsearch
					</div>
					<a className="cursor-pointer" onClick={() => setView("settings")}>
						<GearIcon className="w-6" />
					</a>
				</div>

				<div className="mt-20">
					<div className="mx-auto mt-8 max-w-xs">
						<h1 className="font-bold">Welcome</h1>
						<p className="text-gray-400">
							Create an account or log into your Unsearch account to get started.
						</p>
					</div>

					<div className="mb-30 mt-8">
						<a
							href={`${url}/register?fromExtension=true`}
							target="_blank"
							className={`${buttonVariants({
								variant: "default"
							})} hover:text-inherit`}
						>
							Create an account
						</a>
						<p className="my-2 text-gray-400">or</p>
						<a
							href={`${url}/login?fromExtension=true`}
							target="_blank"
							className={`${buttonVariants({
								variant: "secondary"
							})} hover:text-inherit`}
						>
							Log into your account
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};
