import React, { useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { Button, Input, Label } from "ui";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import logo from "@packages/assets/images/unsearch.png";
import { handleGoogleLogin } from "../utils/auth";

export const Register = () => {
	const { register } = useAuthContext();
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");

	const urlParams = new URLSearchParams(window.location.search);
	const fromExtension = urlParams.get("fromExtension");

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setErrorMessage("");

		try {
			const user = await register(email, password);

			if (fromExtension === "true") {
				window.postMessage({ type: "signupSuccess", user }, "*");
			}
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message); // Display error message from server or generic message
			} else {
				setErrorMessage("Something went wrong, please try again later.");
			}
		}
	}

	return (
		<div className="h-screen w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
			<div className="flex items-center justify-center py-12">
				<div className="mx-auto grid w-[350px] gap-4">
					<div className="grid gap-2 text-center">
						<img src={logo} className="mx-auto mb-4 w-16" />
						<h1 className="text-3xl font-bold">Create an account</h1>
						<p className="text-balance text-muted-foreground">
							Enter your email and password below to create your account
						</p>
					</div>
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
						<div className="grid gap-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password">Password</Label>
								<a href="/request-reset-password" className="text-sm font-bold text-primary">
									Forgot password?
								</a>
							</div>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
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
							Signup
						</Button>
					</form>
					<span className="text-center text-muted-foreground">or</span>
					<Button
						variant="outline"
						onClick={handleGoogleLogin}
						className="w-full bg-slate-100 text-slate-800 hover:bg-slate-200 hover:text-slate-800"
					>
						<img src="./google.png" alt="Google logo" width={22} height={22} className="mr-2" />
						Sign in with Google
					</Button>
					<div className="mt-4 text-center text-sm">
						Already have an account?{" "}
						<a href={`/login${fromExtension ? "?fromExtension=true" : ""}`} className="underline">
							Login
						</a>
					</div>
				</div>
			</div>
			<div className="hidden bg-muted bg-violet-700 lg:block"></div>
		</div>
	);
};
