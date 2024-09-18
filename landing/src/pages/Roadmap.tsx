import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

const roadmapItems = [
	{
		title: "Inception",
		description: "Bookmark and search history sync with a basic cross-browser extension.",
		completed: true
	},
	{
		completed: true,
		version: "Pre-alpha",
		releaseDate: "Jul 23"
	},
	{
		title: "Sync recent tabs",
		description: "Added synchronization for recent tabs",
		completed: true
	},
	{
		title: "Search",
		description: "Exact, fuzzy, and semantic search and other advanced search filters",
		completed: true
	},
	{
		title: "Bidirectional sync of bookmarks",
		description: "Edit and delete bookmarks from the dashboard",
		completed: true
	},
	{
		title: "Copy and move bookmarks",
		description: "Copy and move bookmarks between sessions from the dashboard.",
		completed: true
	},
	{
		title: "Offline management with sync",
		description:
			"Edit, delete, move, and copy bookmarks from the dashboard while offline. Changes synchronize when the session goes back online.",
		completed: true
	},
	{
		title: "Alpha 0.1 Release",
		description: "Initial Alpha release with core features",
		completed: true,
		version: "0.1 Alpha",
		releaseDate: "Sep 12"
	},
	{
		title: "Add custom names to sessions",
		completed: false
	},
	{
		title: "Share collections",
		completed: false
	},
	{
		title: "Add tags",
		completed: false
	},
	{
		title: "SSO",
		completed: false
	},
	{
		title: "Save webpages against link rot",
		completed: false
	},
	{
		title: "Detailed view of search history",
		completed: false
	},
	{
		title: "Access to your data from the extension",
		completed: false
	},
	{
		title: "Save search history conditionally with custom rules",
		completed: false
	},
	{
		title: "End-to-end encryption",
		completed: false
	},
	{
		title: "Show related bookmarks when visiting a page",
		completed: false
	},
	{
		title: "IA integration",
		completed: false
	},
	{
		title: "Support for multiple languages",
		completed: false
	},
	{
		title: "iOS app",
		completed: false
	},
	{
		title: "Android app",
		completed: false
	}
];

export const Roadmap = () => {
	return (
		<div className="relative min-h-screen overflow-hidden">
			<Navbar />

			<h1 className="my-48 mb-8 text-center text-3xl font-bold">Roadmap</h1>
			<div className="relative mx-auto mb-48 max-w-3xl">
				{/* Vertical timeline */}
				<div className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 transform bg-gray-700"></div>

				{/* Roadmap items */}
				{roadmapItems.map((item, index) => (
					<div key={index} className="mb-12 flex items-center">
						{/* Version and release date (left side) */}
						<div className="w-1/2 pr-8 text-right">
							{item.version && (
								<div>
									<div className="text-sm font-bold text-white">{item.version}</div>
									<div className="text-xs text-primary-foreground">{item.releaseDate}</div>
								</div>
							)}
						</div>

						{/* Timeline point */}
						<div
							className={`absolute left-1/2 z-10 h-4 w-4 -translate-x-1/2 transform rounded-full ${
								item.completed ? "bg-primary" : "bg-gray-700"
							}`}
						></div>

						{/* Roadmap item content (right side) */}
						<div className="w-1/2 pl-8">
							<h3
								className={`text-lg font-semibold ${item.completed ? "text-primary" : "text-gray-300"}`}
							>
								{item.title}
							</h3>
							<p className="mt-1 text-sm text-gray-400">{item.description}</p>
							<span
								className={`text-sm font-medium ${item.completed ? "text-primary" : "text-gray-500"} mt-2 inline-block`}
							>
								{item.date}
							</span>
						</div>
					</div>
				))}
			</div>

			<Footer />
		</div>
	);
};
