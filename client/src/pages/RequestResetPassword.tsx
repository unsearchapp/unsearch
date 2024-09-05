import React, { useState } from "react";
import logo from "@packages/assets/images/unsearch.png";
import { Button, Input, Label } from "ui";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export const PasswordResetRequest = () => {
	const [email, setEmail] = useState<string>("");
	const [done, setDone] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMessage("");

		try {
			const response = await fetch("/api/request-reset-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ email })
			});
			if (response.ok) {
				setDone(true);
			} else {
				setErrorMessage("Error sending reset link, please try again later");
			}
		} catch (error) {
			setErrorMessage("Something went wrong, please try again later");
		}
	};

	return (
		<div className="h-screen w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
			<div className="flex items-center justify-center py-12">
				<div className="mx-auto grid w-[350px] gap-6">
					<div className="grid gap-2 text-center">
						<img src={logo} className="mx-auto mb-4 w-16" />
						<h1 className="text-3xl font-bold">Reset password</h1>
						<p className="text-balance text-muted-foreground">
							Enter your email to receive a reset link.
						</p>
					</div>
					{!done ? (
						<form className="grid gap-4" onSubmit={handleSubmit}>
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="m@example.com"
									required
								/>
							</div>
							{errorMessage && (
								<span className="flex items-center gap-x-2 text-sm font-bold text-red-600">
									<ExclamationTriangleIcon className="size-4" />
									{errorMessage}
								</span>
							)}
							<Button type="submit" className="w-full">
								Send reset link
							</Button>
						</form>
					) : (
						`Check your inbox, an email has been sent to ${email} to reset your password.`
					)}
					<div className="mt-4 text-center text-sm">
						Return to{" "}
						<a href={"/login"} className="underline">
							Login
						</a>
					</div>
				</div>
			</div>
			<div className="hidden bg-muted bg-violet-700 lg:block"></div>
		</div>
	);
};
