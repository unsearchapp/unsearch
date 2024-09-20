import logo from "@packages/assets/images/unsearch.png";
import clsx from "clsx";
import { Button, buttonVariants } from "ui";
import browser from "webextension-polyfill";
import { sendMessageToBackground } from "../utils/utils";
import { useState } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";

interface HomeProps {
	email: string;
	isConnected: boolean;
	url: string;
	port: browser.Runtime.Port | null;
}

export const Home: React.FC<HomeProps> = ({ email, isConnected, port, url }) => {
	const [loading, setLoading] = useState<boolean>(false);

	const handleClick = async () => {
		setLoading(true);
		if (port) {
			try {
				await sendMessageToBackground(port, { type: "SESSION_CONNECT" });
				port.postMessage({ type: "GET_STATUS" });
				setLoading(false);
			} catch (error) {
				setLoading(false);
			}
		}
	};

	const handleDisconnect = async () => {
		setLoading(true);
		if (port) {
			try {
				await sendMessageToBackground(port, { type: "SESSION_DISCONNECT" });
				port.postMessage({ type: "GET_STATUS" });
				setLoading(false);
			} catch (error) {
				setLoading(false);
			}
		}
	};

	return (
		<div className="h-[500px] w-[400px]">
			<div className="mx-auto p-4">
				<div className="flex justify-between">
					<div className="mb-4 flex items-center gap-x-2">
						<img src={logo} className="w-6" alt="Logo" />
						<span className="font-bold">Unsearch</span>
					</div>

					<span className="text-sm text-muted-foreground">{email}</span>
				</div>

				<div className="mt-20 text-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						className={clsx(
							"mx-auto w-12",
							isConnected ? "text-violet-700" : "text-muted-foreground"
						)}
					>
						<path
							fillRule="evenodd"
							d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75Zm2.03 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v4.94a.75.75 0 0 0 1.5 0v-4.94l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z"
							clipRule="evenodd"
						/>
					</svg>

					<p className="text-sm">{isConnected ? "Connected" : "Not connected"}</p>

					<div className="mb-30 mt-8 flex flex-col">
						{isConnected ? (
							<Button onClick={handleDisconnect} disabled={loading} variant={"default"}>
								{loading ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : null}
								Disconnect
							</Button>
						) : (
							<Button onClick={handleClick} disabled={loading} variant={"default"}>
								{loading ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> : null}
								Connect
							</Button>
						)}
						<a
							href={`${url}`}
							target="_blank"
							className={`${buttonVariants({
								variant: "secondary"
							})} my-2 hover:text-inherit`}
						>
							Open dashboard
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};
