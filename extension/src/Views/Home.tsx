import logo from "@packages/assets/images/unsearch.png";
import { buttonVariants } from "ui";

interface HomeProps {
	email: string;
}

export const Home: React.FC<HomeProps> = ({ email }) => {
	return (
		<div className="h-[500px] w-[400px]">
			<div className="mx-auto p-4">
				<div className="mb-4 flex items-center gap-x-2 font-bold">
					<img src={logo} className="w-6" alt="Logo" />
					Unsearch
				</div>

				<div className="mt-8 text-sm">
					<p className="font-bold">Account</p>
					<p>{email}</p>
				</div>
				<div className="mt-20 text-center">
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
