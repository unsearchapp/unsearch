import { queryDb } from "./db";
import { test, expect } from "./fixtures";

test.describe("Registration E2E Test", () => {
	test("should register and insert user data in the database", async ({
		page,
		context,
		extensionId
	}) => {
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

		// Close and open again the extension popup
		await popupPage.close();
		popupPage = await openPopup();

		// Check extension url
		await expect(popupPage).toHaveURL(popupUrl);

		// Check we are now in the home page
		await expect(popupPage.locator('text="test@example.com"')).toBeVisible();
		await expect(popupPage.locator('text="Not connected"')).toBeVisible();

		// Verify that the data was inserted into the database
		const result = await queryDb(`SELECT * FROM "Users" WHERE "email" = 'test@example.com'`);
		expect(result).toHaveLength(1);
		expect(result[0]).toHaveProperty("email", "test@example.com");
	});
});
test.afterEach(async () => {
	// Cleanup: Remove the test user from the database
	await queryDb(`DELETE FROM "Users" WHERE "email" = 'test@example.com'`);
});
