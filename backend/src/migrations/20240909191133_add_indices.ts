import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	// Create index on userId
	await knex.schema.table("HistoryItems", (table) => {
		table.index("userId", "idx_historyitems_userId");
	});

	// Create a composite index on userId and sessionId for filtering
	await knex.schema.table("HistoryItems", (table) => {
		table.index(["userId", "sessionId"], "idx_historyitems_userId_sessionId");
	});

	// Create an index on lastVisitTime to optimize ordering
	await knex.schema.table("HistoryItems", (table) => {
		table.index("lastVisitTime", "idx_historyitems_lastVisitTime");
	});

	await knex.schema.table("HistoryItems", (table) => {
		table.index(
			["userId", "sessionId", "lastVisitTime"],
			"idx_historyitems_user_session_lastVisit"
		);
	});
}

export async function down(knex: Knex): Promise<void> {
	// Drop indexes
	await knex.schema.table("HistoryItems", (table) => {
		table.dropIndex("userId", "idx_historyitems_userId");
	});

	await knex.schema.table("HistoryItems", (table) => {
		table.dropIndex(["userId", "sessionId"], "idx_historyitems_userId_sessionId");
	});

	await knex.schema.table("HistoryItems", (table) => {
		table.dropIndex("lastVisitTime", "idx_historyitems_lastVisitTime");
	});

	await knex.schema.table("HistoryItems", (table) => {
		table.dropIndex(
			["userId", "sessionId", "lastVisitTime"],
			"idx_historyitems_user_session_lastVisit"
		);
	});
}
