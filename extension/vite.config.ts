import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";
import fs from "fs";

// Define the environment variable for the browser
const browser = process.env.VITE_BROWSER || "firefox";
const manifestSrc = path.resolve(__dirname, `manifests/manifest-${browser}.json`);
const manifestDest = path.resolve(__dirname, "public/manifest.json");

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
				dir: `dist/${browser}` // Build output directory
			}
		},
		emptyOutDir: true // Clear the output directory before each build
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
		{
			name: "copy-manifest-before-build",
			config() {
				// Ensure the manifest file is copied before the build starts
				if (!fs.existsSync(manifestSrc)) {
					throw new Error(`Manifest file ${manifestSrc} does not exist.`);
				}
				fs.copyFileSync(manifestSrc, manifestDest);
				console.log(`Copied ${manifestSrc} to ${manifestDest}`);
			}
		},
		viteStaticCopy({
			targets: [
				{
					src: "node_modules/webextension-polyfill/dist/browser-polyfill.js",
					dest: `${browser}`
				}
			]
		})
	]
});
