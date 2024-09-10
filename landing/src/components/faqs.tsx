import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "ui";

export const FAQs = () => {
	return (
		<div className="py-16">
			<h2 className="mb-6 text-4xl font-bold">FAQs</h2>

			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger>What is it?</AccordionTrigger>
					<AccordionContent>
						Unsearch is a cross-browser manager for browsing data. It allows you to sync, manage,
						and search your bookmarks, tabs, and search history from any browser, all in one place.
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger>Can I use it?</AccordionTrigger>
					<AccordionContent>
						Yes, Unsearch is available for everyone. You can either{" "}
						<a href="https://docs.unsearch.app/developers/self-host" target="_blank">
							self-host
						</a>{" "}
						it for free or use our cloud version. The cloud version provides a hassle-free
						experience without the need to set up and maintain your own infrastructure.
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger>How does it work?</AccordionTrigger>
					<AccordionContent>
						Unsearch uses WebSockets to sync data between your browser extensions and the dashboard.
						This bidirectional communication allows you to manage your bookmarks, tabs, and search
						history even when your browser extensions are offline. Once the extensions are back
						online, any changes made are automatically synced.
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger>Who is this for?</AccordionTrigger>
					<AccordionContent>
						Unsearch is designed for anyone who wants a safe and simple solution to manage browsing
						data across multiple browsers. It's especially useful for people who work across
						different devices or browsers and want a seamless way to access and control their
						bookmarks, tabs, and search history from anywhere.
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger>Where is my data stored?</AccordionTrigger>
					<AccordionContent>
						If you use Unsearch cloud, your data is stored in a database located in the EU. All
						sensitive data, such as bookmarks and search history, is encrypted to ensure privacy and
						security. We do not sell or share your data with third parties, and you can delete all
						your data at any time through the dashboard.
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger>Will I lose access to my data if I cancel my plan?</AccordionTrigger>
					<AccordionContent>
						No, you won't lose access to your data if you cancel your plan. When you cancel, it
						simply means your subscription will not be renewed at the end of the current billing
						period. You will continue to have full access to all your data and the service until the
						plan expires. After that, you will still retain access to your data, even without an
						active subscription.
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger>
						What makes Unsearch different from Chrome or Firefox Sync?
					</AccordionTrigger>
					<AccordionContent>
						Unlike Chrome Sync or Firefox Sync, which only work within their respective browsers,
						Unsearch allows you to sync and manage data across multiple browsers. It provides a
						unified dashboard for easy access and management of your browsing data, regardless of
						the browser you use.
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger>How does Unsearch make money?</AccordionTrigger>
					<AccordionContent>
						Unsearch is a fully open-source project, and the self-hosted version is available for
						free. We make money by offering a paid cloud version of the service, which provides
						additional convenience for those who prefer not to manage their own infrastructure.
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
};
