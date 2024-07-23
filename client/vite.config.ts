import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	base: "/",
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@packages": path.resolve(__dirname, "../packages"),
			"ui": path.resolve(__dirname, "../packages/ui/src")
		}
	},
	server: {
		host: true,
		port: Number(process.env.CLIENT_PORT),
		proxy: {
			"/api": {
				target: process.env.APP_URL,
				changeOrigin: true
			}
		}
	},
	plugins: [react(), tsconfigPaths({ loose: true })]
});
