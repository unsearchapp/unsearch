import type { Knex } from "knex";
import { logger } from "../../src/utils/logger";

export async function up(knex: Knex): Promise<void> {
	logger.info(`Running migration ${__filename}`);

	return knex.raw("CREATE EXTENSION IF NOT EXISTS pg_trgm;");
}

export async function down(knex: Knex): Promise<void> {
	return knex.raw("DROP EXTENSION IF EXISTS pg_trgm;");
}
