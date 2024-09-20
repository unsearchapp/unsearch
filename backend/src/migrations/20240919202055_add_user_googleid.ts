import type { Knex } from "knex";
import { logger } from "../utils/logger";

export async function up(knex: Knex): Promise<void> {
	logger.info(`Running migration ${__filename}`);

	await knex.schema.alterTable("Users", (table) => {
		table.string("googleId").nullable().unique();
		table.string("password").nullable().alter();
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable("Users", (table) => {
		table.dropColumn("googleId");
		table.string("password").notNullable().alter();
	});
}
