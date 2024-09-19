import type { Knex } from "knex";
import { logger } from "../utils/logger";

export async function up(knex: Knex): Promise<void> {
	logger.info(`Running migration ${__filename}`);

	// Step 1: Add the 'name' column as nullable first
	await knex.schema.table("Sessions", (table) => {
		table.string("name").nullable();
	});

	// Step 2: Copy values from 'browser' to 'name'
	await knex("Sessions").update({
		name: knex.ref("browser")
	});

	// Step 3: Make the 'name' column non-nullable
	await knex.schema.table("Sessions", (table) => {
		table.string("name").notNullable().alter();
	});
}

export async function down(knex: Knex): Promise<void> {
	logger.info(`Reverting migration ${__filename}`);

	// Revert the migration by removing the 'name' column
	await knex.schema.table("Sessions", (table) => {
		table.dropColumn("name");
	});
}
