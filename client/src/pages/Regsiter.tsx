import React, { useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { Button, Input, Label } from "ui";
import logo from "@packages/assets/images/unsearch.png";

export const Register = () => {
	const { register } = useAuthContext();
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		try {
			await register(email, password);

			const urlParams = new URLSearchParams(window.location.search);
			const fromExtension = urlParams.get("fromExtension");

			if (fromExtension === "true") {
				window.postMessage({ type: "signupSuccess", text: "success" }, "*");
			}
		} catch (error) {
			console.log(error);
		}
	}

	return (
		<div className="h-screen w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
			<div className="flex items-center justify-center py-12">
				<div className="mx-auto grid w-[350px] gap-6">
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
							<div className="flex items-center">
								<Label htmlFor="password">Password</Label>
							</div>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						<Button type="submit" className="w-full">
							Signup
						</Button>
					</form>
					<div className="mt-4 text-center text-sm">
						Already have an account?{" "}
						<a href="/login" className="underline">
							Login
						</a>
					</div>
				</div>
			</div>
			<div className="hidden bg-muted bg-violet-700 lg:block"></div>
		</div>
	);
};
