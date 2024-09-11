import Knex from "knex";
import { Pool } from "pg";
import path from "path";

// Encryption key
export const encryptionKey = process.env.PG_SECRET_KEY;
const isProduction = process.env.NODE_ENV === "production";

let connectionString = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

// Used for auth sessions
export const pool = new Pool({
	connectionString,
	...(isProduction && {
		ssl: {
			rejectUnauthorized: false
		}
	})
});

export const knex = Knex({
	client: "postgresql",
	connection: {
		connectionString,
		...(isProduction && {
			ssl: {
				rejectUnauthorized: false
			}
		})
	},
	pool: {
		min: 2,
		max: 100
	},
	migrations: {
		directory: path.resolve(__dirname, "../migrations") // Adjust path to your migrations directory
	}
});
