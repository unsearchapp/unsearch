import logo from "@packages/assets/images/unsearch.png";
import { buttonVariants } from "ui";

export const Welcome = () => {
	return (
		<div className="mx-auto flex h-[500px] w-[400px]">
			<div className="mx-auto p-4 text-center">
				<div className="mb-4 flex items-center gap-x-2 font-bold">
					<img src={logo} className="w-6" alt="Logo" />
					Unsearch
				</div>

				<div className="mt-20">
					<div className="mx-auto mt-8 max-w-xs">
						<h1 className="font-bold">Welcome</h1>
						<p className="text-gray-400">
							Create an account or log into your Unsearch account to get started.
						</p>
					</div>

					<div className="mb-30 mt-8">
						<a
							href={`${import.meta.env.VITE_WEBAPP_URL}/register?fromExtension=true`}
							target="_blank"
							className={`${buttonVariants({
								variant: "default"
							})} hover:text-inherit`}
						>
							Create an account
						</a>
						<p className="my-2 text-gray-400">or</p>
						<a
							href={`${import.meta.env.VITE_WEBAPP_URL}/login?fromExtension=true`}
							target="_blank"
							className={`${buttonVariants({
								variant: "secondary"
							})} hover:text-inherit`}
						>
							Log into your account
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};
