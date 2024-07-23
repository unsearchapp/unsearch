import logo from "@packages/assets/images/unsearch.png";
import mockup from "@packages/assets/images/mockup.png";
import { Button, Input, buttonVariants } from "ui";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { submitData } from "./api/Submit";
import { useState } from "react";

function App() {
	const [success, setSuccess] = useState<boolean>(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email") as string;

		await submitData(email);
		setSuccess(true);
	}
	return (
		<div className="min-h-screen overflow-x-auto">
			<div className="fixed left-0 right-0 top-0 z-50">
				<div className="w-full bg-background px-8">
					<div className="mx-auto flex max-w-4xl items-center justify-between py-4">
						<div className="flex gap-x-2">
							<img src={logo} className="h-8 w-8" alt="React logo" />
							<span className="my-auto text-xl font-bold text-white">Unsearch</span>
						</div>
						<div className="flex gap-x-4">
							<a href={import.meta.env.VITE_GITHUB_URL} target="_blank">
								<GitHubLogoIcon className="my-auto h-7 w-7" />
							</a>
							<a href={import.meta.env.VITE_DISCORD_URL} target="_blank">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="my-auto h-8 w-8"
								>
									<path d="M19.3034 5.33716C17.9344 4.71103 16.4805 4.2547 14.9629 4C14.7719 4.32899 14.5596 4.77471 14.411 5.12492C12.7969 4.89144 11.1944 4.89144 9.60255 5.12492C9.45397 4.77471 9.2311 4.32899 9.05068 4C7.52251 4.2547 6.06861 4.71103 4.70915 5.33716C1.96053 9.39111 1.21766 13.3495 1.5891 17.2549C3.41443 18.5815 5.17612 19.388 6.90701 19.9187C7.33151 19.3456 7.71356 18.73 8.04255 18.0827C7.41641 17.8492 6.82211 17.5627 6.24904 17.2231C6.39762 17.117 6.5462 17.0003 6.68416 16.8835C10.1438 18.4648 13.8911 18.4648 17.3082 16.8835C17.4568 17.0003 17.5948 17.117 17.7434 17.2231C17.1703 17.5627 16.576 17.8492 15.9499 18.0827C16.2789 18.73 16.6609 19.3456 17.0854 19.9187C18.8152 19.388 20.5875 18.5815 22.4033 17.2549C22.8596 12.7341 21.6806 8.80747 19.3034 5.33716ZM8.5201 14.8459C7.48007 14.8459 6.63107 13.9014 6.63107 12.7447C6.63107 11.5879 7.45884 10.6434 8.5201 10.6434C9.57071 10.6434 10.4303 11.5879 10.4091 12.7447C10.4091 13.9014 9.57071 14.8459 8.5201 14.8459ZM15.4936 14.8459C14.4535 14.8459 13.6034 13.9014 13.6034 12.7447C13.6034 11.5879 14.4323 10.6434 15.4936 10.6434C16.5442 10.6434 17.4038 11.5879 17.3825 12.7447C17.3825 13.9014 16.5548 14.8459 15.4936 14.8459Z"></path>
								</svg>
							</a>
						</div>
					</div>
					<div className="flex h-1 w-full items-center justify-center">
						<div className="h-px w-1/2 bg-gradient-to-r from-transparent to-white/10"></div>
						<div className="h-px w-1/2 bg-gradient-to-l from-transparent to-white/10"></div>
					</div>
				</div>
			</div>

			<div className="relative isolate px-2 lg:px-8">
				<div className="sm:pt-38 relative z-10 mx-auto max-w-4xl pb-10 pt-32">
					<div className="flex flex-col items-center py-14 text-center">
						<h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-6xl">
							All your browsing activity in one place.
						</h1>
						<p className="mt-6 text-xl leading-8 text-gray-400">
							Sync and manage all your bookmarks and browsing history from multiple browsers in one
							place, without the limitations of the sync solutions offered by major browsers.
						</p>
						<div className="mt-10 flex flex-col items-center gap-y-6 sm:flex-row sm:gap-x-6">
							{!success ? (
								<form
									onSubmit={handleSubmit}
									className="flex w-full max-w-md flex-col gap-y-4 sm:flex-row sm:gap-x-2"
								>
									<Input
										type="email"
										name="email"
										placeholder="email@domain.com"
										required
										className="w-full"
									/>
									<Button type="submit" className="w-full sm:w-auto">
										Notify me on launch
									</Button>
								</form>
							) : (
								<span className="text-center">
									Thank you for your interest! You'll be <br /> the first to know when the alpha is
									released.
								</span>
							)}

							<a
								href={import.meta.env.VITE_GITHUB_URL}
								target="_blank"
								className={`${buttonVariants({
									variant: "secondary"
								})} hover:text-inherit flex w-full gap-x-2 sm:w-auto`}
							>
								<GitHubLogoIcon />
								Star on GitHub
							</a>
						</div>

						<div className="relative mt-10 flex w-full justify-center">
							<svg
								viewBox="0 0 1024 1024"
								className="absolute -top-20 left-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:h-[64rem] sm:w-[64rem]"
								aria-hidden="true"
							>
								<circle
									cx="512"
									cy="512"
									r="512"
									fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
									fillOpacity="0.7"
								/>
								<defs>
									<radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
										<stop stopColor="#7775D6" />
										<stop offset="1" stopColor="#6d28d9" />
									</radialGradient>
								</defs>
							</svg>
							<img
								src={mockup}
								alt="Dashboard screenshot"
								loading="lazy"
								className="rounded-md shadow-md ring-1 ring-teal-600/25 sm:w-[78rem] sm:max-w-none"
							/>
						</div>
					</div>
				</div>
			</div>

			<main className="mx-auto mt-8 max-w-4xl">
				<h2 className="mb-8 text-center text-4xl font-bold">Cooming soon</h2>

				<div className="mx-auto max-w-md space-y-8">
					<div className="mx-2 rounded-lg bg-gray-900 p-6 shadow-lg sm:mx-0">
						<h2 className="text-5xl font-bold text-white">$6</h2>
						<p className="text-gray-400">/user/month*</p>

						<ul className="mt-6 space-y-2 text-gray-300">
							<li className="flex items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="mr-2 h-5 w-5 text-violet-600"
								>
									<path
										fillRule="evenodd"
										d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
										clipRule="evenodd"
									/>
								</svg>
								Bidirectional sync of browsing history and bookmarks
							</li>
							<li className="flex items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="mr-2 h-5 w-5 text-violet-600"
								>
									<path
										fillRule="evenodd"
										d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
										clipRule="evenodd"
									/>
								</svg>
								End-to-end encryption
							</li>
							<li className="flex items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="mr-2 h-5 w-5 text-violet-600"
								>
									<path
										fillRule="evenodd"
										d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
										clipRule="evenodd"
									/>
								</svg>
								Exact, fuzzy and semantic search
							</li>
							<li className="flex items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="mr-2 h-5 w-5 text-violet-600"
								>
									<path
										fillRule="evenodd"
										d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
										clipRule="evenodd"
									/>
								</svg>
								Import & Export all your data
							</li>
							<li className="flex items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="mr-2 h-5 w-5 text-violet-600"
								>
									<path
										fillRule="evenodd"
										d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
										clipRule="evenodd"
									/>
								</svg>
								Advanced search filters
							</li>
							<li className="flex items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="mr-2 h-5 w-5 text-violet-600"
								>
									<path
										fillRule="evenodd"
										d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
										clipRule="evenodd"
									/>
								</svg>
								Custom rules for saving browsing history
							</li>
							<li className="flex items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="mr-2 h-5 w-5 text-violet-600"
								>
									<path
										fillRule="evenodd"
										d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
										clipRule="evenodd"
									/>
								</svg>
								Support for Chromium, Chrome, Firefox, Opera & Edge
							</li>
						</ul>

						<p className="mt-4 text-sm text-gray-400">*final price may change</p>

						{!success ? (
							<form
								onSubmit={handleSubmit}
								className="mt-6 flex w-full max-w-md flex-col gap-y-4 sm:flex-row sm:gap-x-2"
							>
								<Input type="email" name="email" placeholder="email@domain.com" required />
								<Button>Notify me on launch</Button>
							</form>
						) : (
							<p className="mt-6 text-center">
								Thank you for your interest! You'll be <br /> the first to know when the alpha is
								released.
							</p>
						)}
					</div>

					<div className="mx-2 rounded-lg bg-gray-900 p-6 shadow-lg sm:mx-0">
						<h2 className="mb-4 text-4xl font-bold text-white">Self-hosting</h2>
						<p className="text-gray-400">Always free. Currently in pre-alpha version.</p>
						<a
							href={import.meta.env.VITE_GITHUB_URL}
							target="_blank"
							className={`${buttonVariants({
								variant: "default"
							})} hover:text-inherit mt-6 flex w-full gap-x-2`}
						>
							<GitHubLogoIcon />
							Star on GitHub
						</a>
					</div>
				</div>
			</main>

			<footer className="mt-8 py-6 md:px-8 md:py-0">
				<div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
					<p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
						Building Unsearch with care from the EU 🇪🇺. The source code is available on{" "}
						<a
							href={import.meta.env.VITE_GITHUB_URL}
							target="_blank"
							rel="noreferrer"
							className="font-medium underline underline-offset-4"
						>
							GitHub
						</a>
						. Join me on this journey in{" "}
						<a
							href={import.meta.env.VITE_DISCORD_URL}
							target="_blank"
							rel="noreferrer"
							className="font-medium underline underline-offset-4"
						>
							Discord
						</a>
					</p>
				</div>
			</footer>
		</div>
	);
}

export default App;
