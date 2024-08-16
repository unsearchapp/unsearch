import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	// Add new columns for msg_type and msg_payload without the notNullable constraint
	await knex.schema.alterTable("Messages", (table) => {
		table.string("msg_type");
		table.json("msg_payload");
	});

	// Update the existing records to populate the new columns
	const messages = await knex("Messages").select("_id", "message");
	for (const msg of messages) {
		const parsedMessage = JSON.parse(msg.message);
		await knex("Messages").where("_id", msg._id).update({
			msg_type: parsedMessage.type,
			msg_payload: parsedMessage.payload
		});
	}

	// Alter the columns to add the notNullable constraint now that they're populated
	await knex.schema.alterTable("Messages", (table) => {
		table.string("msg_type").notNullable().alter();
		table.json("msg_payload").notNullable().alter();
	});

	// Drop the original 'message' column
	await knex.schema.alterTable("Messages", (table) => {
		table.dropColumn("message");
	});
}

export async function down(knex: Knex): Promise<void> {
	// Re-add the 'message' column
	await knex.schema.alterTable("Messages", (table) => {
		table.text("message").nullable();
	});

	// Populate the 'message' column using the 'msg_type' and 'msg_payload' columns
	const messages = await knex("Messages").select("_id", "msg_type", "msg_payload");
	for (const msg of messages) {
		const message = JSON.stringify({
			type: msg.msg_type,
			payload: msg.msg_payload
		});
		await knex("Messages").where("_id", msg._id).update({
			message
		});
	}

	// Remove the 'msg_type' and 'msg_payload' columns
	await knex.schema.alterTable("Messages", (table) => {
		table.dropColumns("msg_type", "msg_payload");
	});
}
