import { defineConfig } from "vocs";

export default defineConfig({
	title: "Docs",
	markdown: {
		code: {
			themes: {
				dark: "github-dark",
				light: "github-light"
			}
		}
	},
	sidebar: [
		{
			text: "Product",
			items: [
				{ text: "Introduction", link: "/product/introduction" },
				{ text: "Getting Started", link: "/product/getting-started" },
				{ text: "Features", link: "/product/features" },
				{ text: "Faq", link: "/product/faq" },
				{ text: "Privacy", link: "/product/privacy" },
				{ text: "Security", link: "/product/security" }
			]
		},
		{
			text: "Developers",
			items: [{ text: "Self host", link: "/developers/self-host" }]
		},
		{
			text: "Company",
			items: [
				{ text: "About", link: "/company/about" },
				{ text: "Terms", link: "/company/terms" }
			]
		},
		{
			text: "Changelog",
			items: [{ text: "0.1.0", link: "/changelog/0_1_0" }]
		}
	],
	banner: "Head to our new [Discord](https://discord.com/invite/HtqQegCZ4j)!",
	logoUrl: "/unsearch.png",
	iconUrl: "/favicon.ico"
});
