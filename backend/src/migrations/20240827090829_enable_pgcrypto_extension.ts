import type { Knex } from "knex";
import { logger } from "../../src/utils/logger";
import { encryptionKey } from "../db/db";

export async function up(knex: Knex): Promise<void> {
	logger.info(`Running migration ${__filename}`);

	await knex.raw("CREATE EXTENSION IF NOT EXISTS pgcrypto;");

	await knex.schema.alterTable("Tabs", (table) => {
		table.binary("title").alter();
		table.binary("url").alter();
		table.binary("favIconUrl").alter();
	});

	await knex.schema.alterTable("HistoryItems", (table) => {
		table.binary("title").alter();
		table.binary("url").alter();
	});

	await knex.schema.alterTable("Bookmarks", (table) => {
		table.binary("title").alter();
		table.binary("url").alter();
	});

	await knex.raw(
		`UPDATE "Tabs"
    SET 
      title = CASE WHEN title IS NOT NULL THEN pgp_sym_encrypt(title::text, ?) ELSE NULL END,
      url = CASE WHEN url IS NOT NULL THEN pgp_sym_encrypt(url::text, ?) ELSE NULL END,
      "favIconUrl" = CASE WHEN "favIconUrl" IS NOT NULL THEN pgp_sym_encrypt("favIconUrl"::text, ?) ELSE NULL END;`,
		[encryptionKey, encryptionKey, encryptionKey]
	);

	await knex.raw(
		`UPDATE "HistoryItems"
    SET 
      title = CASE WHEN title IS NOT NULL THEN pgp_sym_encrypt(title::text, ?) ELSE NULL END,
      url = CASE WHEN url IS NOT NULL THEN pgp_sym_encrypt(url::text, ?) ELSE NULL END;`,
		[encryptionKey, encryptionKey]
	);

	await knex.raw(
		`UPDATE "Bookmarks"
    SET 
      title = CASE WHEN title IS NOT NULL THEN pgp_sym_encrypt(title::text, ?) ELSE NULL END,
      url = CASE WHEN url IS NOT NULL THEN pgp_sym_encrypt(url::text, ?) ELSE NULL END;`,
		[encryptionKey, encryptionKey]
	);
}

export async function down(knex: Knex): Promise<void> {
	// await knex.raw("DROP EXTENSION IF EXISTS pgcrypto;");
	if (!encryptionKey) {
		throw new Error("PGCRYPTO_SECRET_KEY environment variable is not set.");
	}

	// Step 1: Create temporary text columns to hold decrypted values
	await knex.schema.alterTable("Tabs", (table) => {
		table.text("decrypted_title");
		table.text("decrypted_url");
		table.text("decrypted_favIconUrl");
	});

	await knex.schema.alterTable("HistoryItems", (table) => {
		table.text("decrypted_title");
		table.text("decrypted_url");
	});

	await knex.schema.alterTable("Bookmarks", (table) => {
		table.text("decrypted_title");
		table.text("decrypted_url");
	});

	// Step 2: Decrypt existing data into temporary columns
	await knex.raw(
		`UPDATE "Tabs"
    SET 
      decrypted_title = CASE WHEN title IS NOT NULL THEN pgp_sym_decrypt(title::bytea, ?) ELSE NULL END,
      decrypted_url = CASE WHEN url IS NOT NULL THEN pgp_sym_decrypt(url::bytea, ?) ELSE NULL END,
      decrypted_favIconUrl = CASE WHEN "favIconUrl" IS NOT NULL THEN pgp_sym_decrypt("favIconUrl"::bytea, ?) ELSE NULL END;`,
		[encryptionKey, encryptionKey, encryptionKey]
	);

	await knex.raw(
		`UPDATE "HistoryItems"
    SET 
      decrypted_title = CASE WHEN title IS NOT NULL THEN pgp_sym_decrypt(title::bytea, ?) ELSE NULL END,
      decrypted_url = CASE WHEN url IS NOT NULL THEN pgp_sym_decrypt(url::bytea, ?) ELSE NULL END;`,
		[encryptionKey, encryptionKey]
	);

	await knex.raw(
		`UPDATE "Bookmarks"
    SET 
      decrypted_title = CASE WHEN title IS NOT NULL THEN pgp_sym_decrypt(title::bytea, ?) ELSE NULL END,
      decrypted_url = CASE WHEN url IS NOT NULL THEN pgp_sym_decrypt(url::bytea, ?) ELSE NULL END;`,
		[encryptionKey, encryptionKey]
	);

	// Step 3: Alter original columns back to text type
	await knex.schema.alterTable("Tabs", (table) => {
		table.text("title").alter();
		table.text("url").alter();
		table.text("favIconUrl").alter();
	});

	await knex.schema.alterTable("HistoryItems", (table) => {
		table.text("title").alter();
		table.text("url").alter();
	});

	await knex.schema.alterTable("Bookmarks", (table) => {
		table.text("title").alter();
		table.text("url").alter();
	});

	// Step 4: Move decrypted data back to original columns
	await knex.raw(`
    UPDATE "Tabs"
    SET 
      title = decrypted_title,
      url = decrypted_url,
			"favIconUrl" = decrypted_favIconUrl
  `);

	await knex.raw(`
    UPDATE "HistoryItems"
    SET 
      title = decrypted_title,
      url = decrypted_url,
  `);

	await knex.raw(`
    UPDATE "Bookmarks"
    SET 
      title = decrypted_title,
      url = decrypted_url,
  `);

	// Step 5: Drop temporary columns
	await knex.schema.alterTable("Tabs", (table) => {
		table.dropColumn("decrypted_title");
		table.dropColumn("decrypted_url");
		table.dropColumn("decrypted_favIconUrl");
	});

	await knex.schema.alterTable("Bookmarks", (table) => {
		table.dropColumn("decrypted_title");
		table.dropColumn("decrypted_url");
	});

	await knex.schema.alterTable("HistoryItems", (table) => {
		table.dropColumn("decrypted_title");
		table.dropColumn("decrypted_url");
	});

	// Step 6: Drop the pgcrypto extension
	await knex.raw("DROP EXTENSION IF EXISTS pgcrypto;");
}
