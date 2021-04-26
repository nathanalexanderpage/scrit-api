import { env } from "./env";
import fs from "fs-extra";
import { Client } from "pg";

const dropTables = async () => {
	const client = new Client({
		host: env.db.host,
		port: env.db.port,
		user: env.db.username,
		password: env.db.password,
		database: env.db.database,
	});

	try {
		await client.connect();
		const sql = await fs.readFile("./tools/db_tables_drop.sql", { encoding: "UTF-8" });
		const statements = sql.split(/;\s*$/m);

		for (const statement of statements) {
			if (statement.length > 3) {
				await client.query(statement);
			}
		}
	} catch (err) {
		console.log(err);
		throw err;
	} finally {
		await client.end();
	}
};

dropTables().then(() => {
	console.log("finished");
}).catch((err) => {
	console.log("finished with errors");
	console.log(err);
});
