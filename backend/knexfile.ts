import { Knex } from "knex";

interface KnexConfig {
	[key: string]: Knex.Config;
}

let connectionString = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

const config: KnexConfig = {
	development: {
		client: "pg",
		connection: {
			host: process.env.PGHOST,
			user: process.env.PGUSER,
			password: process.env.PGPASSWORD,
			database: process.env.PGDATABASE,
			port: Number(process.env.PGPORT)
		},
		migrations: {
			directory: "./src/migrations",
			extension: "ts"
		}
	},
	production: {
		client: "postgresql",
		connection: {
			connectionString: connectionString,
			ssl: {
				rejectUnauthorized: false
			}
		},
		migrations: {
			directory: "./src/migrations",
			extension: "ts"
		}
	}
};

const env: "development" | "production" =
	(process.env.KNEX_ENV as "development" | "production") || "development";

module.exports = config[env];
