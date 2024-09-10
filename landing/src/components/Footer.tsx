export const Footer = () => {
	return (
		<footer className="mt-8 py-6 md:px-8 md:py-0">
			<div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
				<p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
					Unsearch is developed in Spain 🇪🇸 and deployed in the EU 🇪🇺. The source code is available
					on{" "}
					<a
						href={import.meta.env.VITE_GITHUB_URL}
						target="_blank"
						rel="noreferrer"
						className="font-medium underline underline-offset-4"
					>
						GitHub
					</a>
					. Join me on this journey in{" "}
					<a
						href={import.meta.env.VITE_DISCORD_URL}
						target="_blank"
						rel="noreferrer"
						className="font-medium underline underline-offset-4"
					>
						Discord
					</a>
				</p>
			</div>
		</footer>
	);
};
