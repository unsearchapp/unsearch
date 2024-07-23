/**
 * {@type require('prettier').Config}
 */
module.exports = {
	useTabs: true,
	printWidth: 100,
	singleQuote: false,
	trailingComma: "none",
	bracketSameLine: false,
	semi: true,
	quoteProps: "consistent",
	tailwindConfig: "./packages/ui/tailwind.config.js",
	plugins: ["prettier-plugin-tailwindcss"]
};
