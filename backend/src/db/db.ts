import Knex from "knex";
import { Pool } from "pg";
import path from "path";

// Encryption key
export const encryptionKey = process.env.PG_SECRET_KEY;
const isProduction = process.env.NODE_ENV === "production";

// Used for auth sessions
export const pool = new Pool({
	user: process.env.PGUSER,
	host: process.env.PGHOST,
	database: process.env.PGDATABASE,
	password: process.env.PGPASSWORD,
	port: parseInt(process.env.PGPORT!)
});

export const knex = Knex({
	client: "pg",
	connection: {
		user: process.env.PGUSER,
		host: process.env.PGHOST,
		database: process.env.PGDATABASE,
		password: process.env.PGPASSWORD,
		port: parseInt(process.env.PGPORT!),
		...(isProduction && {
			ssl: {
				rejectUnauthorized: true
			}
		})
	},
	pool: {
		min: 2,
		max: 10
	},
	migrations: {
		directory: path.resolve(__dirname, "../migrations") // Adjust path to your migrations directory
	}
});
