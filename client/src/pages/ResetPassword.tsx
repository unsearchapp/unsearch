import React, { useState, useEffect } from "react";
import logo from "@packages/assets/images/unsearch.png";
import { Button, Input, Label } from "ui";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export const ResetPassword = () => {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");
	const [errorMessage, setErrorMessage] = useState<string>("");
	const navigate = useNavigate();

	// Redirect to the password reset request page if token is missing
	useEffect(() => {
		if (!token) {
			navigate("/request-reset-password");
		}
	}, [token, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMessage("");

		if (password !== confirmPassword) {
			setErrorMessage("Passwords don't match");
			return;
		}

		try {
			const response = await fetch("/api/reset-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ token, newPassword: password })
			});
			if (response.ok) {
				navigate("/login");
			} else {
				setErrorMessage("Error resetting password, please try again later");
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
						<p className="text-balance text-muted-foreground">Enter your new password.</p>
					</div>
					<form className="grid gap-4" onSubmit={handleSubmit}>
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="confirmPassword">Confirm password</Label>
							<Input
								id="confirmPassword"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
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
							Reset password
						</Button>
					</form>
				</div>
			</div>
			<div className="hidden bg-muted bg-violet-700 lg:block"></div>
		</div>
	);
};
