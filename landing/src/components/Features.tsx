import { FeaturesGrid } from "./FeaturesGrid";
import sessionsMockup from "@packages/assets/images/sessions-mockup.png";
import searchMockup from "@packages/assets/images/search-mockup.png";

export const Features = () => {
	return (
		<div className="mx-auto mt-28 max-w-6xl px-4 text-white">
			<h2 className="mb-2 text-3xl font-bold">Manage your browsing data seamlessly</h2>
			<p className="text-muted-foreground">
				Unsearch simplifies managing your bookmarks, tabs, and search history across all your
				browsers. Sync and secure your data, and access it from anywhere.
			</p>
			<div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
				<div className="rounded-lg border border-muted p-6 shadow-md shadow-muted md:col-span-2">
					<h3 className="mb-2 text-xl font-semibold">Sync across browsers</h3>
					<p className="mb-4 text-muted-foreground">
						Bidirectional sync of your bookmarks, tabs, and history across different browsers.
						Access your browsing data on the dashboard and the browser at the same time.
					</p>
					<div className="relative aspect-video overflow-hidden rounded-md">
						<img src={sessionsMockup} alt="Sessions page" />
					</div>
				</div>

				<div className="rounded-lg border border-muted p-6 shadow-md shadow-muted">
					<h3 className="mb-2 text-xl font-semibold">Offline mode</h3>
					<p className="mb-4 text-gray-300">
						Manage your data offline and sync changes to the browser once you're back online.
					</p>
					<div className="relative flex aspect-square items-center overflow-hidden rounded-md">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							className="mx-auto size-24 text-primary sm:size-48"
						>
							<path
								fillRule="evenodd"
								d="M1.371 8.143c5.858-5.857 15.356-5.857 21.213 0a.75.75 0 0 1 0 1.061l-.53.53a.75.75 0 0 1-1.06 0c-4.98-4.979-13.053-4.979-18.032 0a.75.75 0 0 1-1.06 0l-.53-.53a.75.75 0 0 1 0-1.06Zm3.182 3.182c4.1-4.1 10.749-4.1 14.85 0a.75.75 0 0 1 0 1.061l-.53.53a.75.75 0 0 1-1.062 0 8.25 8.25 0 0 0-11.667 0 .75.75 0 0 1-1.06 0l-.53-.53a.75.75 0 0 1 0-1.06Zm3.204 3.182a6 6 0 0 1 8.486 0 .75.75 0 0 1 0 1.061l-.53.53a.75.75 0 0 1-1.061 0 3.75 3.75 0 0 0-5.304 0 .75.75 0 0 1-1.06 0l-.53-.53a.75.75 0 0 1 0-1.06Zm3.182 3.182a1.5 1.5 0 0 1 2.122 0 .75.75 0 0 1 0 1.061l-.53.53a.75.75 0 0 1-1.061 0l-.53-.53a.75.75 0 0 1 0-1.06Z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
				</div>

				<div className="rounded-lg border border-muted p-6 shadow-md shadow-muted">
					<h3 className="mb-2 text-xl font-semibold">Encrypted storage</h3>
					<p className="mb-4 text-gray-300">
						All sensitive data is encrypted and stored securely in the EU under strict privacy laws.
					</p>
					<div className="relative flex aspect-square items-center overflow-hidden rounded-md">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							className="mx-auto size-24 text-primary sm:size-48"
						>
							<path
								fillRule="evenodd"
								d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
				</div>

				<div className="rounded-lg border border-muted p-6 shadow-md shadow-muted md:col-span-2">
					<h3 className="mb-2 text-xl font-semibold">Flexible search</h3>
					<p className="mb-4 text-gray-300">
						Find what you need quickly with exact, fuzzy, and semantic search.
					</p>
					<div className="relative aspect-video overflow-hidden rounded-md">
						<img src={searchMockup} alt="Search filters" />
					</div>
				</div>
			</div>

			<FeaturesGrid />
		</div>
	);
};
