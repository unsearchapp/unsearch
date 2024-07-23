import Knex from "knex";
import { Pool } from "pg";

// Used for auth sessions
export const pool = new Pool({
	user: process.env.PGUSER,
	host: process.env.PGHOST,
	database: process.env.PGDATABASE,
	password: process.env.PGPASSWORD,
	port: parseInt(process.env.PGPORT!)
});

const knex = Knex({
	client: "pg",
	connection: {
		user: process.env.PGUSER,
		host: process.env.PGHOST,
		database: process.env.PGDATABASE,
		password: process.env.PGPASSWORD,
		port: parseInt(process.env.PGPORT!)
	},
	pool: {
		min: 2,
		max: 10
	}
});

export default knex;
