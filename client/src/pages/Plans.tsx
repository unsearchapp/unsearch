import React, { useEffect } from "react";
import { Button } from "ui";
import { useAuthContext } from "../hooks/useAuthContext";
import { PageLayout } from "../components/Layout";
import { FAQs } from "../components/FAQs";

const features: string[] = [
	"Bidirectional sync of bookmarks",
	"Sync search history and recent tabs",
	"Connect unlimited sessions",
	"Database encryption",
	"Advanced search filters",
	"Import & export your data"
];

export const Plans = () => {
	const { isPaid, user, checkAuth } = useAuthContext();

	useEffect(() => {
		const queryParams = new URLSearchParams(location.search);
		const sessionId = queryParams.get("session_id");

		if (sessionId) {
			checkAuth();
		}
	}, []);

	const handleClick = async () => {
		const response = await fetch("/api/create-checkout-session", {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ priceId: "YOUR_PRICE_ID" })
		});

		const { url } = await response.json();
		window.location.href = url;
	};

	const openPortal = () => {
		fetch("/api/customer-portal", {
			method: "POST",
			credentials: "include"
		})
			.then((response) => {
				return response.json();
			})
			.then((session) => {
				window.location.href = session.url;
			})
			.catch((error) => {});
	};

	return (
		<>
			<PageLayout>
				<h2 className="mb-8 mt-20 text-center text-4xl font-bold">Select your plan</h2>
				<div className="mx-auto w-full max-w-md space-y-8">
					<div className="rounded-lg bg-gray-900 p-6 shadow-lg sm:mx-0">
						<h2 className="text-5xl font-bold text-white">$6</h2>
						<p className="text-gray-400">/month</p>

						<ul className="mt-6 space-y-2 text-gray-300">
							{features.map((feature) => (
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
									{feature}
								</li>
							))}
						</ul>

						<div className="mt-8 flex flex-col gap-y-4">
							{isPaid ? (
								<Button>Subscribed</Button>
							) : (
								<Button onClick={handleClick}>Subscribe</Button>
							)}
							{user && user.customerId && (
								<Button variant={"secondary"} onClick={openPortal}>
									Manage billing
								</Button>
							)}
						</div>
					</div>

					<div className="mx-auto max-w-md p-8">
						<div className="mx-auto max-w-md rounded-lg p-8 shadow-lg">
							<h2 className="mb-6 text-center text-2xl font-bold text-white">
								Install the browser extension
							</h2>
							<div className="flex justify-center space-x-4">
								<a
									href="https://chromewebstore.google.com/detail/unsearch/hcalfepkjgcohdhnjhdpbnifeopodkkh"
									target="_blank"
									className="group flex flex-col items-center space-y-2 text-gray-300 transition-colors duration-200 hover:text-white"
									aria-label="Install Chrome extension"
								>
									<div className="rounded-full p-3 transition-colors duration-200 group-hover:text-gray-200">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 512 512"
											className="h-10 w-10 fill-current text-gray-300 transition-colors duration-200 group-hover:text-white"
										>
											<path d="M0 256C0 209.4 12.5 165.6 34.3 127.1L144.1 318.3C166 357.5 207.9 384 256 384C270.3 384 283.1 381.7 296.8 377.4L220.5 509.6C95.9 492.3 0 385.3 0 256zM365.1 321.6C377.4 302.4 384 279.1 384 256C384 217.8 367.2 183.5 340.7 160H493.4C505.4 189.6 512 222.1 512 256C512 397.4 397.4 511.1 256 512L365.1 321.6zM477.8 128H256C193.1 128 142.3 172.1 130.5 230.7L54.2 98.5C101 38.5 174 0 256 0C350.8 0 433.5 51.5 477.8 128V128zM168 256C168 207.4 207.4 168 256 168C304.6 168 344 207.4 344 256C344 304.6 304.6 344 256 344C207.4 344 168 304.6 168 256z" />
										</svg>
									</div>
									<span>Chrome</span>
								</a>
								<a
									href="https://addons.mozilla.org/es/firefox/addon/unsearch/"
									target="_blank"
									className="group flex flex-col items-center space-y-2 text-gray-300 transition-colors duration-200 hover:text-white"
									aria-label="Install Firefox extension"
								>
									<div className="rounded-full p-3 transition-colors duration-200 group-hover:text-gray-200">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 512 512"
											className="h-10 w-10 fill-current text-gray-300 transition-colors duration-200 group-hover:text-white"
										>
											<path d="M503.5 241.5c-.1-1.6-.2-3.1-.2-4.7v-.1l-.4-4.7v-.1a245.9 245.9 0 0 0 -7.3-41.2c0-.1 0-.1-.1-.2l-1.1-4c-.1-.2-.1-.5-.2-.6-.4-1.2-.7-2.5-1.1-3.7-.1-.2-.1-.6-.2-.8-.4-1.2-.7-2.4-1.1-3.5-.1-.4-.2-.6-.4-1-.4-1.2-.7-2.3-1.2-3.5l-.4-1.1c-.4-1.1-.8-2.3-1.2-3.4a8.3 8.3 0 0 0 -.4-1c-.5-1.1-.8-2.3-1.3-3.4-.1-.2-.2-.6-.4-.8-.5-1.2-1-2.3-1.4-3.5 0-.1-.1-.2-.1-.4-1.6-3.8-3.2-7.7-5-11.4l-.4-.7c-.5-1-.8-1.8-1.3-2.6-.2-.5-.5-1.1-.7-1.6-.4-.8-.8-1.6-1.2-2.4-.4-.6-.6-1.2-1-1.8s-.8-1.4-1.2-2.3c-.4-.6-.7-1.3-1.1-1.9s-.8-1.4-1.2-2.2a18.1 18.1 0 0 0 -1.2-2c-.4-.7-.8-1.3-1.2-2s-.8-1.3-1.2-2-.8-1.3-1.2-1.9-.8-1.4-1.3-2.2a15.6 15.6 0 0 0 -1.2-1.8L463.2 119a15.6 15.6 0 0 0 -1.2-1.8c-.5-.7-1.1-1.6-1.6-2.3-.4-.5-.7-1.1-1.1-1.6l-1.8-2.5c-.4-.5-.6-.8-1-1.3-1-1.3-1.8-2.5-2.8-3.7a248.8 248.8 0 0 0 -23.5-26.6A186.8 186.8 0 0 0 412 62.5c-4-3.5-8.2-6.7-12.5-9.8a162.5 162.5 0 0 0 -24.6-15.1c-2.4-1.3-4.8-2.5-7.2-3.7a254 254 0 0 0 -55.4-19.6c-1.9-.4-3.8-.8-5.6-1.2h-.1c-1-.1-1.8-.4-2.8-.5a236.4 236.4 0 0 0 -38-4H255.1a234.6 234.6 0 0 0 -45.5 5c-33.6 7.1-63.2 21.2-82.9 39-1.1 1-1.9 1.7-2.4 2.2l-.5 .5H124l-.1 .1 .1-.1a.1 .1 0 0 0 .1-.1l-.1 .1a.4 .4 0 0 1 .2-.1c14.6-8.8 34.9-16 49.4-19.6l5.9-1.4c.4-.1 .8-.1 1.2-.2 1.7-.4 3.4-.7 5.2-1.1 .2 0 .6-.1 .8-.1C250.9 20.9 319.3 40.1 367 85.6a171.5 171.5 0 0 1 26.9 32.8c30.4 49.2 27.5 111.1 3.8 147.6-34.4 53-111.4 71.3-159 24.8a84.2 84.2 0 0 1 -25.6-59 74.1 74.1 0 0 1 6.2-31c1.7-3.8 13.1-25.7 18.2-24.6-13.1-2.8-37.6 2.6-54.7 28.2-15.4 22.9-14.5 58.2-5 83.3a132.9 132.9 0 0 1 -12.1-39.2c-12.2-82.6 43.3-153 94.3-170.5-27.5-24-96.5-22.3-147.7 15.4-29.9 22-51.2 53.2-62.5 90.4 1.7-20.9 9.6-52.1 25.8-83.9-17.2 8.9-39 37-49.8 62.9-15.6 37.4-21 82.2-16.1 124.8 .4 3.2 .7 6.4 1.1 9.6 19.9 117.1 122 206.4 244.8 206.4C392.8 503.4 504 392.2 504 255 503.9 250.5 503.8 245.9 503.5 241.5z" />
										</svg>
									</div>
									<span>Firefox</span>
								</a>
							</div>
						</div>
					</div>

					<FAQs />
				</div>
			</PageLayout>
		</>
	);
};
