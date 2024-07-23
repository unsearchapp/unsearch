import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
	resolve: {
		alias: {
			"@packages": path.resolve(__dirname, "../packages"),
			"ui": path.resolve(__dirname, "../packages/ui/src"),
			"@src": path.resolve(__dirname, "../packages/ui/src")
		}
	},
	plugins: [react()]
});
