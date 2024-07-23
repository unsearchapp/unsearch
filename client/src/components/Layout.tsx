import React, { ReactNode } from "react";
import { Button, Sheet, SheetTrigger, SheetContent } from "ui";
import logo from "@packages/assets/images/unsearch.png";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useLocation } from "react-router-dom";
import { clsx } from "clsx";

interface PageLayoutProps {
	children: ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
	const { logout } = useAuthContext();
	const location = useLocation();

	function handleLogout(e: React.MouseEvent<HTMLElement>) {
		logout();
		window.location.reload();
	}

	return (
		<div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
			<div className="hidden border-r bg-muted/40 md:block">
				<div className="flex h-full max-h-screen flex-col gap-2">
					<div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
						<a href="/" className="flex items-center gap-2 font-semibold">
							<img src={logo} className="w-7" />
							<span>Unsearch</span>
						</a>
					</div>
					<div className="flex-1">
						<nav className="grid items-start px-2 text-sm font-medium lg:px-4">
							<a
								href="/"
								className={clsx(
									"flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-white",
									location.pathname === "/" ? "bg-muted" : "text-muted-foreground"
								)}
							>
								Dashboard
							</a>
							<a
								href="/bookmarks"
								className={clsx(
									"flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-white",
									location.pathname === "/bookmarks" ? "bg-muted" : "text-muted-foreground"
								)}
							>
								Bookmarks
							</a>
							<a
								href="/sessions"
								className={clsx(
									"flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-white",
									location.pathname === "/sessions" ? "bg-muted" : "text-muted-foreground"
								)}
							>
								Sessions
							</a>
							<a
								href="#"
								onClick={handleLogout}
								className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-red-800"
							>
								Logout
							</a>
						</nav>
					</div>
				</div>
			</div>
			<div className="flex flex-col">
				<header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline" size="icon" className="shrink-0 md:hidden">
								{/* <Menu className="h-5 w-5" /> */}
								<HamburgerMenuIcon className="h-5 w-5" />
								<span className="sr-only">Toggle navigation menu</span>
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="flex flex-col">
							<nav className="grid gap-2 text-lg font-medium">
								<a href="/" className="flex items-center gap-2 text-lg font-semibold">
									<img src={logo} className="w-7" />
									<span>Unsearch</span>
								</a>
								<a
									href="/"
									className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
								>
									Dashboard
								</a>
								<a
									href="/bookmarks"
									className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
								>
									Bookmarks
								</a>
								<a
									href="/sessions"
									className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
								>
									Sessions
								</a>
								<a
									href="#"
									onClick={handleLogout}
									className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-red-800"
								>
									Logout
								</a>
							</nav>
						</SheetContent>
					</Sheet>
				</header>
				<main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
			</div>
		</div>
	);
};
