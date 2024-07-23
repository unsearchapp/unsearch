import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, "index.html"),
				background: resolve(__dirname, "src/background.js")
			},
			output: {
				entryFileNames: "[name].js",
				chunkFileNames: "[name].js",
				assetFileNames: "[name].[ext]",
				dir: "dist"
			}
		}
	},
	resolve: {
		alias: {
			"@packages": resolve(__dirname, "../packages"),
			"ui": resolve(__dirname, "../packages/ui/src"),
			"@src": resolve(__dirname, "../packages/ui/src")
		}
	},
	server: {
		fs: {
			allow: [".."]
		}
	},
	plugins: [
		react(),
		viteStaticCopy({
			targets: [
				{
					src: "node_modules/webextension-polyfill/dist/browser-polyfill.js",
					dest: ""
				}
			]
		})
	]
});
