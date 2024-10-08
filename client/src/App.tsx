import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Main } from "./pages/Main";
import { Login } from "./pages/Login";
import { Register } from "./pages/Regsiter";
import { Sessions } from "./pages/Sessions";
import { Bookmarks } from "./pages/Bookmarks";
import { Tabs } from "./pages/Tabs";
import { Logs } from "./pages/Logs";
import { Plans } from "./pages/Plans";
import { NotFound } from "./pages/NotFound";
import { useAuthContext } from "./hooks/useAuthContext";
import { ResetPassword } from "./pages/ResetPassword";
import { PasswordResetRequest } from "./pages/RequestResetPassword";

const App: React.FC = () => {
	const { isAuthenticated } = useAuthContext();

	const isSelfHosted = import.meta.env.VITE_SELF_HOSTED === "true";

	return (
		<BrowserRouter>
			<Routes>
				{/* Public Routes */}
				<Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
				<Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

				<Route path="/request-reset-password" element={<PasswordResetRequest />} />
				<Route path="/reset-password" element={<ResetPassword />} />

				{/* Protected Routes */}
				<Route path="/" element={isAuthenticated ? <Main /> : <Navigate to="/login" />} />
				<Route
					path="/sessions"
					element={isAuthenticated ? <Sessions /> : <Navigate to="/login" />}
				/>
				<Route path="/tabs" element={isAuthenticated ? <Tabs /> : <Navigate to="/login" />} />
				<Route path="/logs" element={isAuthenticated ? <Logs /> : <Navigate to="/login" />} />
				<Route
					path="/bookmarks"
					element={isAuthenticated ? <Bookmarks /> : <Navigate to="/login" />}
				/>

				{/* Plans Route (only if not self-hosted) */}
				{!isSelfHosted && (
					<Route path="/plans" element={isAuthenticated ? <Plans /> : <Navigate to="/login" />} />
				)}

				{/* 404 Route */}
				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
