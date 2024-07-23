import type { Knex } from "knex";

const config: { [key: string]: Knex.Config } = {
	development: {
		client: "pg",
		connection: {
			host: process.env.PGHOST,
			user: process.env.PGUSER,
			password: process.env.PGPASSWORD,
			database: process.env.PGDATABASE,
			port: parseInt(process.env.PGPORT!)
		},
		migrations: {
			directory: "./src/migrations",
			extension: "ts"
		}
	}
};

module.exports = config;
