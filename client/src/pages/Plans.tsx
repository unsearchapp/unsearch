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

					<FAQs />
				</div>
			</PageLayout>
		</>
	);
};
