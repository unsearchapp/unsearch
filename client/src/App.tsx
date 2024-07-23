import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Main } from "./pages/Main";
import { Login } from "./pages/Login";
import { Register } from "./pages/Regsiter";
import { Sessions } from "./pages/Sessions";
import { Bookmarks } from "./pages/Bookmarks";
import { useAuthContext } from "./hooks/useAuthContext";

const App: React.FC = () => {
	const { isAuthenticated } = useAuthContext();

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
				<Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
				<Route element={isAuthenticated ? <Main /> : <Navigate to="/login" />} path="/" />
				<Route
					element={isAuthenticated ? <Sessions /> : <Navigate to="/login" />}
					path="/sessions"
				/>
				<Route
					element={isAuthenticated ? <Bookmarks /> : <Navigate to="/login" />}
					path="/bookmarks"
				/>
			</Routes>
		</BrowserRouter>
	);
};

export default App;
