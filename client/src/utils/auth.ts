export const handleGoogleLogin = () => {
	const params = new URLSearchParams(window.location.search);
	const fromExtension = params.get("fromExtension");

	// Redirect to the Google auth route in your backend, with fromExtension if true
	const googleAuthUrl =
		fromExtension === "true" ? `/api/auth/google?fromExtension=true` : `/api/auth/google`;

	window.location.href = googleAuthUrl;
};
