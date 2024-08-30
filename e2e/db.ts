import { Client } from "pg";

export async function queryDb(query: string) {
	const client = new Client({
		user: process.env.PGUSER,
		host: process.env.PGHOST,
		database: process.env.PGDATABASE,
		password: process.env.PGPASSWORD,
		port: Number(process.env.PGPORT)
	});

	try {
		await client.connect();
		const res = await client.query(query);
		return res.rows;
	} catch (err) {
		throw err;
	} finally {
		await client.end();
	}
}
