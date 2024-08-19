import type { Knex } from "knex";
import { logger } from "../utils/logger";

export async function up(knex: Knex): Promise<void> {
	logger.info(`Running migration ${__filename}`);

	await knex.schema.table("Users", (table) => {
		table.string("customerId").unique();
		table.boolean("isPaid").defaultTo(false);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.table("Users", (table) => {
		table.dropColumn("customerId");
		table.dropColumn("isPaid");
	});
}
