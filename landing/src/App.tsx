import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { Pricing } from "./pages/Pricing";
import { Roadmap } from "./pages/Roadmap";
import { NotFound } from "./pages/NotFound";

const App: React.FC = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Landing />} />
				<Route path="/pricing" element={<Pricing />} />
				<Route path="/roadmap" element={<Roadmap />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
