import { env } from "./env";
import fs from "fs-extra";
import { Client } from "pg";

const createDatabase = async () => {
	const client = new Client({
		host: env.db.host,
		port: env.db.port,
		user: env.db.adminUsername,
		password: env.db.adminPassword,
		database: env.db.defaultDatabase,
	});

	try {
		await client.connect();
		const sql = await fs.readFile("tools/db_init.sql", { encoding: "UTF-8" });
		const statements = sql.split(/;\s*$/m);

		for (const statement of statements) {
			if (statement.length > 3) {
				console.log(statement);
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

createDatabase().then(() => {
	console.log("finished");
}).catch((err) => {
	console.log("finished with errors");
});
