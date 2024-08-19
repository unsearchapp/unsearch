import React, { useEffect } from "react";
import { Button } from "ui";
import { useAuthContext } from "../hooks/useAuthContext";
import { PageLayout } from "../components/Layout";

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
				<div className="mx-auto mt-8 min-w-[300px] space-y-8">
					<div className="mx-2 w-full rounded-lg bg-gray-900 p-6 shadow-lg sm:mx-0">
						<h2 className="text-5xl font-bold text-white">$6</h2>
						<p className="text-gray-400">/month</p>

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
				</div>
			</PageLayout>
		</>
	);
};
