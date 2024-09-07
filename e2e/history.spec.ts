import { queryDb } from "./db";
import { test, expect } from "./fixtures";

test.describe("History E2E Test", () => {
	test("should sync search history and display it in the dashboard", async ({
		context,
		extensionId,
		baseURL
	}) => {
		// Define the searches that will be made
		const initialSearches = [
			`${baseURL}/register?fromExtension=true`,
			`${baseURL}/`, // redirects to /plans
			`${baseURL}/plans`,
			`${baseURL}/`
		];
		const searches = ["https://playwright.dev/", "https://unsearch.app/", "https://example.com/"];

		const expectedUrls = initialSearches.concat(searches);

		// Navigate to the extension's popup URL
		const popupUrl = `chrome-extension://${extensionId}/index.html`;

		async function openPopup() {
			// Navigate to the popup URL
			const newPage = await context.newPage();
			await newPage.goto(popupUrl);
			await newPage.waitForLoadState();
			return newPage;
		}

		// Open extension popup
		let popupPage = await openPopup();

		// Ensure the popup is opened
		await expect(popupPage).toHaveTitle("Unsearch extension"); // Adjust the title as necessary
		await expect(popupPage.locator('text="Welcome"')).toBeVisible();

		// Interact with the popup
		const [newPage] = await Promise.all([
			context.waitForEvent("page"), // Wait for the new page to open
			popupPage.click('text="Create an account"') // Simulate the click
		]);

		// Check redirection to the webapp is made
		await expect(newPage).toHaveURL("/register?fromExtension=true");

		// Enter email and password
		await newPage.fill('input[type="email"]', "test@example.com");
		await newPage.fill('input[type="password"]', "password123");

		// Submit the registration form
		await newPage.click('button:text("Signup")');

		// Assert that the user is redirected after registration
		await expect(newPage).toHaveURL("/plans");

		// Get the existing cookies
		const cookies = await context.cookies();

		// Find and update the specific cookie (connect.sid) // !Required to pass tests with docker
		cookies.map(async (cookie) => {
			if (cookie.name === "connect.sid") {
				await context.addCookies([
					{
						...cookie,
						domain: "backend" // Necessary so extension can send auth requests to the docker service
					}
				]);
			}
			return cookie;
		});

		// Update manually plan
		await queryDb(`UPDATE "Users" SET "isPaid" = true WHERE "email" = 'test@example.com'`);

		// Close and open again the extension popup
		await popupPage.close();
		popupPage = await openPopup();

		// Check extension url
		await expect(popupPage).toHaveURL(popupUrl);

		// Check we are now in the home page
		await expect(popupPage.locator('text="test@example.com"')).toBeVisible();
		await expect(popupPage.locator('text="Not connected"')).toBeVisible();

		// Click connect
		await popupPage.locator('button:text("Connect")').click();

		// Check extension is connected
		await expect(popupPage.getByText("Connected")).toBeVisible();
		await expect(popupPage.locator('button:text("Disconnect")')).toBeVisible();

		// Close extension
		await popupPage.close();

		// Make some searches on the browser
		for (const search of searches) {
			const searchPage = await context.newPage();
			await searchPage.goto(search);
			await searchPage.close();
		}

		// Go to dashboard page
		await newPage.goto("/");
		await expect(newPage).toHaveURL("/");

		// Select the table and extract the text from the center column of each row
		const rows = await newPage.locator("table tbody tr").all();

		// The request to the extension url also gets registered so +1 to the expectedUrls
		await expect(rows).toHaveLength(expectedUrls.length + 1);

		const tableData = await Promise.all(
			rows.map(async (row) => {
				return await row.locator("td:nth-of-type(2)").textContent(); // 2nd column contains the urls
			})
		);

		// Ensure all search queries are present in the table
		for (const query of expectedUrls) {
			const found = tableData.some((text) => text && text.includes(query));
			expect(found).toBe(true); // Assert that each search query is found in the table data
		}
	});
});
test.afterEach(async () => {
	// Cleanup: Remove the test user from the database and the history items
	await queryDb(`DELETE FROM "Users" WHERE "email" = 'test@example.com';`);
	await queryDb(`DELETE FROM "HistoryItems";`);
});
