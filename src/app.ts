import express from "express";
import { env } from "./env";
import pgPromise from "pg-promise";

// app setup
const app = express();
const port = 8008;

// database setup
// const pgp = pgPromise();
// const db = pgp(env.db);

app.get("/", (req, res) => {
	res.status(200);
	res.end("Scrit ping successful. Your hero's journey begins.");
});

app.listen(port, () => {
	console.log(`Server ready at http://localhost:${port}`);
});
