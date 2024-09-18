import { useState } from "react";
import { buttonVariants } from "ui";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import logo from "@packages/assets/images/unsearch.png";

export const Navbar = () => {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<div>
			<svg
				viewBox="0 0 4096 1024"
				className="absolute left-1/2 -z-10 h-[8rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
				aria-hidden="true"
			>
				<ellipse
					cx="2048"
					cy="512"
					rx="2048"
					ry="512"
					fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
					fill-opacity="0.7"
				/>
				<defs>
					<radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
						<stop stopColor="#7775D6" />
						<stop offset="1" stopColor="#6d28d9" />
					</radialGradient>
				</defs>
			</svg>
			<div className="fixed left-0 right-0 top-0 z-50">
				<div className="w-full bg-background px-8">
					<div className="mx-auto flex max-w-4xl items-center justify-between py-4">
						<a className="flex gap-x-2" href="/">
							<img src={logo} className="h-8 w-8" alt="React logo" />
							<span className="my-auto text-xl font-bold text-white">Unsearch</span>
						</a>

						{/* Mobile menu button */}
						<button className="block text-white md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
							{menuOpen ? (
								<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							) : (
								<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M4 6h16M4 12h16m-7 6h7"
									/>
								</svg>
							)}
						</button>

						{/* Full navigation for larger screens */}
						<div className="hidden gap-x-6 md:flex">
							<a href="/pricing" className="text-sm font-bold">
								Pricing
							</a>
							<a href="https://docs.unsearch.app" target="_blank" className="text-sm font-bold">
								Docs
							</a>
							<a href="/roadmap" className="text-sm font-bold">
								Roadmap
							</a>
						</div>

						<div className="hidden gap-x-4 md:flex">
							<a
								href={import.meta.env.VITE_GITHUB_URL}
								target="_blank"
								className={`${buttonVariants({
									variant: "link"
								})} flex w-full gap-x-2 text-white hover:text-inherit sm:w-auto`}
							>
								<GitHubLogoIcon />
								GitHub
							</a>
							<a
								href={"https://dashboard.unsearch.app/login"}
								target="_blank"
								className={`${buttonVariants({
									variant: "default"
								})} flex w-full gap-x-2 hover:text-inherit sm:w-auto`}
							>
								Login
							</a>
						</div>
					</div>

					{/* Mobile Menu */}
					{menuOpen && (
						<div className="mt-4 flex flex-col space-y-4 md:hidden">
							<a href="/pricing" className="text-sm font-bold">
								Pricing
							</a>
							<a href="https://docs.unsearch.app" target="_blank" className="text-sm font-bold">
								Docs
							</a>
							<a href="/roadmap" className="text-sm font-bold">
								Roadmap
							</a>
							<a
								href={import.meta.env.VITE_GITHUB_URL}
								target="_blank"
								className={`${buttonVariants({
									variant: "link"
								})} flex w-full gap-x-2 text-white hover:text-inherit`}
							>
								<GitHubLogoIcon />
								GitHub
							</a>
							<a
								href={"https://dashboard.unsearch.app/login"}
								target="_blank"
								className={`${buttonVariants({
									variant: "default"
								})} flex w-full gap-x-2 hover:text-inherit`}
							>
								Login
							</a>
						</div>
					)}

					<div className="flex h-1 w-full items-center justify-center">
						<div className="h-px w-1/2 bg-gradient-to-r from-transparent to-white/10"></div>
						<div className="h-px w-1/2 bg-gradient-to-l from-transparent to-white/10"></div>
					</div>
				</div>
			</div>
		</div>
	);
};
