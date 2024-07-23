import logo from "@packages/assets/images/unsearch.png";
import { buttonVariants } from "ui";

export const Home = () => {
	return (
		<div className="h-[500px] w-[400px]">
			<div className="mx-auto p-4 text-center">
				<div className="mb-4 flex items-center gap-x-2 font-bold">
					<img src={logo} className="w-6" alt="Logo" />
					Unsearch
				</div>

				<div className="mt-20">
					<div className="mx-auto mt-8 max-w-xs">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							className="mx-auto w-12 text-violet-700"
						>
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
								clipRule="evenodd"
							/>
						</svg>

						<h1 className="text-2xl font-bold">Connected</h1>
					</div>

					<div className="mb-30 mt-8">
						<a
							href={`${import.meta.env.VITE_WEBAPP_URL}`}
							target="_blank"
							className={`${buttonVariants({
								variant: "default"
							})} hover:text-inherit`}
						>
							Open dashboard
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};
