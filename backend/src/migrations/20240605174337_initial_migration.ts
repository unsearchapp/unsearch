import { Knex } from "knex";
import { logger } from "../../src/utils/logger";

export async function up(knex: Knex): Promise<void> {
	logger.info(`Running migration ${__filename}`);

	await knex.schema.createTable("Users", (table) => {
		table.uuid("_id").defaultTo(knex.fn.uuid()).primary();
		table.string("email").notNullable().unique();
		table.string("password").notNullable();
		table.timestamps(true, true);
	});

	await knex.schema.createTable("Sessions", (table) => {
		table.uuid("_id").defaultTo(knex.fn.uuid()).primary();
		table.uuid("userId").notNullable();
		table.string("browser").notNullable();
		table.foreign("userId").references("Users._id").onDelete("CASCADE");
	});

	await knex.schema.createTable("HistoryItems", (table) => {
		table.uuid("_id").defaultTo(knex.fn.uuid()).primary();
		table.uuid("userId").notNullable();
		table.uuid("sessionId").notNullable();
		table.string("id").notNullable();
		table.text("url");
		table.text("title");
		table.timestamp("lastVisitTime");
		table.integer("visitCount");
		table.integer("typedCount");

		table.foreign("userId").references("Users._id").onDelete("CASCADE");
		table.foreign("sessionId").references("Sessions._id").onDelete("CASCADE");
	});

	await knex.schema.createTable("Bookmarks", (table) => {
		table.uuid("_id").defaultTo(knex.fn.uuid()).primary();
		table.uuid("userId").notNullable();
		table.uuid("sessionId").notNullable();
		table.string("id").notNullable();
		table.string("parentId");
		table.integer("index");
		table.text("url");
		table.text("title").notNullable();
		table.timestamp("dateAdded");
		table.timestamp("dateGroupModified");
		table.timestamp("dateLastUsed");

		table.foreign("userId").references("Users._id").onDelete("CASCADE");
		table.foreign("sessionId").references("Sessions._id").onDelete("CASCADE");

		table.unique(["userId", "sessionId", "id"]);
		table
			.foreign(["userId", "sessionId", "parentId"])
			.references(["userId", "sessionId", "id"])
			.inTable("Bookmarks")
			.onDelete("SET NULL");
	});

	await knex.schema.createTable("Messages", (table) => {
		table.uuid("_id").defaultTo(knex.fn.uuid()).primary();
		table.uuid("userId").notNullable();
		table.uuid("sessionId").notNullable();
		table.text("message").notNullable();
		table.string("status", 7).defaultTo("pending"); // pending, sent, error
		table.timestamp("createdAt").defaultTo(knex.fn.now());
		table.timestamp("sentAt");

		table.foreign("userId").references("Users._id").onDelete("CASCADE");
		table.foreign("sessionId").references("Sessions._id").onDelete("CASCADE");
	});

	await knex.schema.createTable("authSessions", (table) => {
		table.string("sid").notNullable().collate("default").primary();
		table.json("sess").notNullable();
		table.timestamp("expire", { precision: 6 }).notNullable();
	});

	// Create index on expire
	await knex.schema.raw('CREATE INDEX "IDX_session_expire" ON "authSessions" ("expire");');
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists("authSessions");
	await knex.schema.dropTableIfExists("Messages");
	await knex.schema.dropTableIfExists("Bookmarks");
	await knex.schema.dropTableIfExists("HistoryItems");
	await knex.schema.dropTableIfExists("Sessions");
	await knex.schema.dropTableIfExists("Users");
}
