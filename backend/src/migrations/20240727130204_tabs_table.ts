import type { Knex } from "knex";
import { logger } from "../../src/utils/logger";

export async function up(knex: Knex): Promise<void> {
	logger.info(`Running migration ${__filename}`);

	await knex.schema.createTable("Tabs", (table) => {
		table.uuid("_id").defaultTo(knex.fn.uuid()).primary();
		table.uuid("userId").notNullable();
		table.uuid("sessionId").notNullable();
		table.timestamp("date").notNullable();
		table.text("favIconUrl");
		table.integer("id");
		table.boolean("incognito").notNullable();
		table.integer("index").notNullable();
		table.timestamp("lastAccessed");
		table.integer("openerTabId");
		table.boolean("pinned").notNullable();
		table.text("title");
		table.text("url");
		table.integer("windowId").notNullable();
		table.foreign("userId").references("Users._id").onDelete("CASCADE");
		table.foreign("sessionId").references("Sessions._id").onDelete("CASCADE");
		table.unique(["userId", "sessionId", "date", "id"]);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists("Tabs");
}
