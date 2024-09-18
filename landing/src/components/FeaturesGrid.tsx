import {
	BookmarkIcon,
	ArchiveIcon,
	UpdateIcon,
	LockClosedIcon,
	GlobeIcon,
	CopyIcon,
	DownloadIcon,
	GitHubLogoIcon
} from "@radix-ui/react-icons";

export const FeaturesGrid = () => {
	const gridItems = [
		{
			icon: <ArchiveIcon className="mb-2 size-7 text-primary" />,
			title: "Sync history & tabs",
			content: "Sync history and opened tabs across devices."
		},
		{
			icon: <BookmarkIcon className="mb-2 size-7 text-primary" />,
			title: "Sync bookmarks",
			content: "Bidirectional sync of bookmarks across devices."
		},
		{
			icon: <UpdateIcon className="mb-2 size-7 text-primary" />,
			title: "Offline",
			content: "Edit and manage data offline, sync with the browser when online."
		},
		{
			icon: <LockClosedIcon className="mb-2 size-7 text-primary" />,
			title: "Secure storage",
			content: "Your data is encrypted and hosted in the EU."
		},
		{
			icon: <GlobeIcon className="mb-2 size-7 text-primary" />,
			title: "Cross-browser extension",
			content: "Works with Firefox and Chromium-based browsers."
		},
		{
			icon: <CopyIcon className="mb-2 size-7 text-primary" />,
			title: "Copy & move bookmarks",
			content: "Copy or move bookmarks between browsers"
		},
		{
			icon: <DownloadIcon className="mb-2 size-7 text-primary" />,
			title: "Export data",
			content: "Export your history and bookmarks whenever you want."
		},
		{
			icon: <GitHubLogoIcon className="mb-2 size-7 text-primary" />,
			title: "Fully open-source",
			content: "All code is fully open-source."
		}
	];

	return (
		<div className="py-28">
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
				{gridItems.map((item, index) => (
					<div key={index}>
						{item.icon}
						<span className="font-bold text-white">{item.title}.</span>{" "}
						<span className="text-muted-foreground">{item.content}</span>
					</div>
				))}
			</div>
		</div>
	);
};
