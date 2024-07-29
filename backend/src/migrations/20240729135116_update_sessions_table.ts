import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.table("Sessions", (table) => {
		table.string("os", 7).notNullable();
		table.string("arch", 6).notNullable();
		table.timestamp("createdAt").defaultTo(knex.fn.now());
		table.timestamp("lastConnectedAt").defaultTo(knex.fn.now());
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.table("Sessions", (table) => {
		table.dropColumn("os");
		table.dropColumn("arch");
		table.dropColumn("createdAt");
		table.dropColumn("lastConnectedAt");
	});
}
