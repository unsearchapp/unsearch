import React from "react";
import { buttonVariants } from "ui";

export const NotFound = () => {
	return (
		<div className="flex h-screen items-center justify-center">
			<div className="mx-auto mt-8 min-w-[400px] space-y-8">
				<div className="mx-2 w-full rounded-lg bg-gray-900 p-6 shadow-lg sm:mx-0">
					<h2 className="text-5xl font-bold text-white">Oops!</h2>
					<p className="mt-2 text-white">Page not found</p>

					<div className="mt-8 flex flex-col gap-y-4">
						<a
							href={`/`}
							className={`${buttonVariants({
								variant: "default"
							})} hover:text-inherit`}
						>
							Return home
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};
