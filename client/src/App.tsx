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
import { useAuthContext } from "./hooks/useAuthContext";
import ProtectedRoute from "./components/App/ProtectedRoute";

const App: React.FC = () => {
	const { isAuthenticated } = useAuthContext();

	const isSelfHosted = import.meta.env.VITE_SELF_HOSTED === "true";

	return (
		<BrowserRouter>
			<Routes>
				{/* Public Routes */}
				<Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
				<Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

				{/* Protected Routes */}
				<Route
					path="/"
					element={
						<ProtectedRoute requirePaid={!isSelfHosted}>
							<Main />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/sessions"
					element={
						<ProtectedRoute requirePaid={!isSelfHosted}>
							<Sessions />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/tabs"
					element={
						<ProtectedRoute requirePaid={!isSelfHosted}>
							<Tabs />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/logs"
					element={
						<ProtectedRoute requirePaid={!isSelfHosted}>
							<Logs />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/bookmarks"
					element={
						<ProtectedRoute requirePaid={!isSelfHosted}>
							<Bookmarks />
						</ProtectedRoute>
					}
				/>

				{/* Plans Route (only if not self-hosted) */}
				{!isSelfHosted && (
					<Route
						path="/plans"
						element={
							<ProtectedRoute requirePaid={false}>
								<Plans />
							</ProtectedRoute>
						}
					/>
				)}

			</Routes>
		</BrowserRouter>
	);
};

export default App;
