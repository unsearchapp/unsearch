import { buttonVariants } from "ui";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Navbar } from "../components/Navbar";
import { FAQs } from "../components/faqs";
import { Footer } from "../components/Footer";

const features: string[] = [
	"Bidirectional sync of bookmarks",
	"Sync search history and recent tabs",
	"Connect unlimited sessions",
	"Database encryption",
	"Advanced search filters",
	"Import & export your data"
];

export const Pricing = () => {
	return (
		<div className="relative min-h-screen overflow-hidden">
			<Navbar />

			<main className="mx-auto mt-48 max-w-4xl">
				<h2 className="mb-8 text-center text-4xl font-bold">
					Early Adopter <br />
					Pricing
				</h2>

				<div className="mx-auto max-w-md space-y-8">
					<div className="mx-2 rounded-lg bg-gray-900 p-6 shadow-lg sm:mx-0">
						<h2 className="text-5xl font-bold text-white">$6</h2>
						<p className="text-gray-400">/month</p>

						<ul className="mt-6 space-y-2 text-gray-300">
							{features.map((feature) => (
								<li className="flex items-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										className="mr-2 h-5 w-5 text-violet-600"
									>
										<path
											fillRule="evenodd"
											d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
											clipRule="evenodd"
										/>
									</svg>
									{feature}
								</li>
							))}
						</ul>

						<a
							href={"https://dashboard.unsearch.app/register"}
							target="_blank"
							className={`${buttonVariants({
								variant: "default"
							})} mt-8 flex w-full gap-x-2 hover:text-inherit`}
						>
							Create an account
						</a>
					</div>

					<div className="mx-2 rounded-lg bg-gray-900 p-6 shadow-lg sm:mx-0">
						<h2 className="mb-4 text-4xl font-bold text-white">Self-hosting</h2>
						<p className="text-gray-400">Always free. Currently in alpha version.</p>
						<a
							href={import.meta.env.VITE_GITHUB_URL}
							target="_blank"
							className={`${buttonVariants({
								variant: "default"
							})} mt-6 flex w-full gap-x-2 hover:text-inherit`}
						>
							<GitHubLogoIcon />
							View on GitHub
						</a>
					</div>

					<FAQs />
				</div>
			</main>

			<Footer />
		</div>
	);
};
