import express from "express";
import { env } from "./env";
import { Client, Pool } from "pg";

// app setup
const app = express();
const port = 8008;

// database setup
function getClient () {
	return new Client({
		host: env.db.host,
		port: env.db.port,
		user: env.db.username,
		password: env.db.password,
		database: env.db.database,
	});
}

app.use(express.json());

// TODO: check for req.body keys for field entries (currently, any nullable columns will simply be NULL if req.body.nullableField is undefined)

app.get("/", (req, res) => {
	res.status(200);
	res.end("Scrit ping successful. Your hero's journey begins.");
});

app.get("/projects", async (req, res) => {
	const db = getClient();

	try {
		console.log('projects hit')
		const sql = `
			SELECT
				id,
				name,
				description,
				created_at
			FROM
				projects
			ORDER BY
				name;
		`;

		db.connect();
		const result = await db.query(sql);
		console.log(result.rows)

		res.status(200);
		res.json(result.rows);
	} catch (err) {
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.post("/projects", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			INSERT INTO
				projects (
					name,
					description
				)
				VALUES (
					$1,
					$2
				)
			RETURNING id;
		`;

		db.connect();
		const result = await db.query(sql, [req.body.name, req.body.description]);
		console.log(result)

		// TODO: make a timeline entry automatically

		if (result.rowCount > 0) {
			res.status(201);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		if (err.message.includes("duplicate key value")) {
			res.status(400);
			res.send();
		} else {
			res.status(500);
			res.json({error: err.message || err});
		}
	} finally {
		db.end();
	}
});

app.put("/projects", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			UPDATE
				projects
			SET
				name = $2,
				description = $3
			WHERE
				id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.body.id, req.body.name, req.body.description]);
		console.log(result)

		if (result.rowCount > 0) {
			res.status(201);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		res.status(500);
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.delete("/projects/:id", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			DELETE
			FROM
				projects
			WHERE
				id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result);

		if (result.rowCount > 0) {
			res.status(204);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		res.status(500);
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.get("/projects/:id/notes", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			SELECT
				id,
				project_id,
				name,
				content,
				created_at,
				modified_at
			FROM
				project_notes
			WHERE
				project_id = $1
			ORDER BY
				modified_at;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result.rows)

		res.status(200);
		res.json(result.rows);
	} catch (err) {
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.post("/notes", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			INSERT INTO
				project_notes (
					project_id,
					name,
					content
				)
				VALUES (
					$1,
					$2,
					$3
				);
		`;

		db.connect();
		const result = await db.query(sql, [req.body.projectId, req.body.name, req.body.content]);
		console.log(result.rows)

		if (result.rowCount > 0) {
			res.status(201);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		if (err.message.includes("duplicate key value")) {
			res.status(400);
			res.send();
		} else {
			res.status(500);
			res.json({error: err.message || err});
		}
	} finally {
		db.end();
	}
});

app.put("/notes", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			UPDATE
				project_notes
			SET
				project_id = $2,
				name = $3,
				description = $4
			WHERE
				id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.body.id, req.body.projectId, req.body.name, req.body.description]);
		console.log(result)

		if (result.rowCount > 0) {
			res.status(201);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		res.status(500);
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.delete("/notes/:id", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			DELETE
			FROM
				project_notes
			WHERE
				id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result);

		if (result.rowCount > 0) {
			res.status(204);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		res.status(500);
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.get("/projects/:id/timelines", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			SELECT
				id,
				project_id,
				name,
				description
			FROM
				timelines
			WHERE
				project_id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result.rows)

		res.status(200);
		res.json(result.rows);
	} catch (err) {
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.post("/timelines", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			INSERT INTO
				timelines (
					project_id,
					name,
					description
				)
				VALUES (
					$1,
					$2,
					$3
				);
		`;

		db.connect();
		const result = await db.query(sql, [req.body.projectId, req.body.name, req.body.description]);
		console.log(result.rows)

		if (result.rowCount > 0) {
			res.status(201);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		if (err.message.includes("duplicate key value")) {
			res.status(400);
			res.send();
		} else {
			res.status(500);
			res.json({error: err.message || err});
		}
	} finally {
		db.end();
	}
});

app.put("/timelines", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			UPDATE
				timelines
			SET
				project_id = $2,
				name = $3,
				description = $4
			WHERE
				id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.body.id, req.body.projectId, req.body.name, req.body.description]);
		console.log(result)

		if (result.rowCount > 0) {
			res.status(201);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		res.status(500);
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.delete("/timelines/:id", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			DELETE
			FROM
				timelines
			WHERE
				id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result);

		if (result.rowCount > 0) {
			res.status(204);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		res.status(500);
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.get("/projects/:id/meta-locations", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			SELECT
				id,
				project_id,
				name,
				description
			FROM
				locations_meta
			WHERE
				project_id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result.rows)

		res.status(200);
		res.json(result.rows);
	} catch (err) {
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.post("/meta-locations", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			INSERT INTO
				locations_meta (
					project_id,
					name,
					description
				)
				VALUES (
					$1,
					$2,
					$3
				);
		`;

		db.connect();
		const result = await db.query(sql, [req.body.projectId, req.body.name, req.body.description]);
		console.log(result.rows)

		if (result.rowCount > 0) {
			res.status(201);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		if (err.message.includes("duplicate key value")) {
			res.status(400);
			res.send();
		} else {
			res.status(500);
			res.json({error: err.message || err});
		}
	} finally {
		db.end();
	}
});

app.put("/meta-locations", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			UPDATE
				locations_meta
			SET
				project_id = $2,
				name = $3,
				description = $4
			WHERE
				id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.body.id, req.body.projectId, req.body.name, req.body.description]);
		console.log(result)

		if (result.rowCount > 0) {
			res.status(201);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		res.status(500);
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.delete("/meta-locations/:id", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			DELETE
			FROM
				locations_meta
			WHERE
				id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result);

		if (result.rowCount > 0) {
			res.status(204);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		res.status(500);
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.get("/meta-locations/:id/locations", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			SELECT
				id,
				meta_location_id,
				name_for_writer_reference,
				name_canon,
				description
			FROM
				locations
			WHERE
				meta_location_id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result.rows)

		res.status(200);
		res.json(result.rows);
	} catch (err) {
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.get("/projects/:id/locations", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			SELECT
				locations.id,
				locations.meta_location_id,
				locations.name_for_writer_reference,
				locations.name_canon,
				locations.description
			FROM
				locations
			JOIN
				locations_meta ON locations_meta.id = locations.meta_location_id
			WHERE
				locations_meta.project_id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result.rows)

		res.status(200);
		res.json(result.rows);
	} catch (err) {
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.post("/locations", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			INSERT INTO
				locations (
					meta_location_id,
					name_for_writer_reference,
					name_canon,
					description
				)
				VALUES (
					$1,
					$2,
					$3,
					$4
				);
		`;

		db.connect();
		const result = await db.query(sql, [req.body.metaLocationId, req.body.nameForWriterReference, req.body.nameCanon, req.body.description]);
		console.log(result.rows)

		if (result.rowCount > 0) {
			res.status(201);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		if (err.message.includes("duplicate key value")) {
			res.status(400);
			res.send();
		} else {
			res.status(500);
			res.json({error: err.message || err});
		}
	} finally {
		db.end();
	}
});

app.put("/locations", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			UPDATE
				locations
			SET
				meta_location_id = $2,
				name_for_writer_reference = $3,
				name_canon = $4,
				description = $5
			WHERE
				id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.body.id, req.body.metaLocationId, req.body.nameForWriterReference, req.body.nameCanon, req.body.description]);
		console.log(result)

		if (result.rowCount > 0) {
			res.status(201);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		res.status(500);
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.delete("/locations/:id", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			DELETE
			FROM
				locations
			WHERE
				id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result);

		if (result.rowCount > 0) {
			res.status(204);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		res.status(500);
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.get("/projects/:id/meta-characters", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			SELECT
				id,
				project_id,
				name,
				description
			FROM
				characters_meta
			WHERE
				project_id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result.rows)

		res.status(200);
		res.json(result.rows);
	} catch (err) {
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.post("/meta-characters", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			INSERT INTO
				characters_meta (
					project_id,
					name,
					description
				)
				VALUES (
					$1,
					$2,
					$3
				);
		`;

		db.connect();
		const result = await db.query(sql, [req.body.projectId, req.body.name, req.body.description]);
		console.log(result.rows)

		if (result.rowCount > 0) {
			res.status(201);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		if (err.message.includes("duplicate key value")) {
			res.status(400);
			res.send();
		} else {
			res.status(500);
			res.json({error: err.message || err});
		}
	} finally {
		db.end();
	}
});

app.put("/meta-characters", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			UPDATE
				characters_meta
			SET
				project_id = $2,
				name = $3,
				description = $4
			WHERE
				id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.body.id, req.body.projectId, req.body.name, req.body.description]);
		console.log(result)

		if (result.rowCount > 0) {
			res.status(201);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		res.status(500);
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.delete("/meta-characters/:id", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			DELETE
			FROM
				characters_meta
			WHERE
				id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result);

		if (result.rowCount > 0) {
			res.status(204);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		res.status(500);
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.get("/meta-characters/:id/characters", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			SELECT
				id,
				meta_character_id,
				name_for_writer_reference,
				name_given,
				name_goes_by,
				description,
				birthyear,
				birthplace
			FROM
				characters
			WHERE
				meta_character_id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result.rows)

		res.status(200);
		res.json(result.rows);
	} catch (err) {
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.get("/projects/:id/characters", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			SELECT
				characters.id,
				characters.meta_character_id,
				characters.name_for_writer_reference,
				characters.name_given,
				characters.name_goes_by,
				characters.description,
				characters.birthyear,
				characters.birthplace
			FROM
				characters
			JOIN
				characters_meta ON characters_meta.id = characters.meta_character_id
			WHERE
				characters_meta.project_id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result.rows)

		res.status(200);
		res.json(result.rows);
	} catch (err) {
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.get("/characters/:id/events", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			SELECT
				events.id,
				events.timeline_id,
				events.name_for_writer_reference,
				events.name_canon,
				events.datetime_start,
				events.datetime_end,
				events.description
			FROM
				events
			JOIN
				characters_events ON events.id = characters_events.event_id
			WHERE
				characters_events.event_id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result.rows)

		res.status(200);
		res.json(result.rows);
	} catch (err) {
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.get("/events/:id/characters", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			SELECT
				characters.id,
				characters.meta_character_id,
				characters.name_for_writer_reference,
				characters.name_given,
				characters.name_goes_by,
				characters.description,
				characters.birthyear,
				characters.birthplace
			FROM
				characters
			JOIN
				characters_events ON characters_events.character_id = characters.id
			WHERE
				characters_events.event_id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result.rows)

		res.status(200);
		res.json(result.rows);
	} catch (err) {
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.post("/characters", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			INSERT INTO
				characters (
					meta_character_id,
					name_for_writer_reference,
					name_given,
					name_goes_by,
					description,
					birthyear,
					birthplace
				)
				VALUES (
					$1,
					$2,
					$3,
					$4,
					$5,
					$6,
					$7
				);
		`;

		db.connect();
		const result = await db.query(sql, [req.body.metaCharacterId, req.body.nameForWriterReference, req.body.nameGiven, req.body.nameGoesBy, req.body.description, req.body.birthyear, req.body.birthplace]);
		console.log(result.rows)

		if (result.rowCount > 0) {
			res.status(201);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		if (err.message.includes("duplicate key value")) {
			res.status(400);
			res.send();
		} else {
			res.status(500);
			res.json({error: err.message || err});
		}
	} finally {
		db.end();
	}
});

app.put("/characters", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			UPDATE
				characters
			SET
				meta_character_id = $2,
				name_for_writer_reference = $3,
				name_given = $4,
				name_goes_by = $5,
				description = $6,
				birthyear = $7,
				birthplace = $8
			WHERE
				id = $1;
		`;

		db.connect();

		const result = await db.query(sql, [
			req.body.id,
			req.body.metaCharacterId,
			req.body.nameForWriterReference,
			req.body.nameGiven,
			req.body.nameGoesBy,
			req.body.description,
			req.body.birthyear,
			req.body.birthplace,
		]);

		console.log(result)

		if (result.rowCount > 0) {
			res.status(201);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		res.status(500);
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.delete("/characters/:id", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			DELETE
			FROM
				characters
			WHERE
				id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result);

		if (result.rowCount > 0) {
			res.status(204);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		res.status(500);
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.get("/timelines/:id/events", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			SELECT
				id,
				timeline_id,
				name_for_writer_reference,
				name_canon,
				datetime_start,
				datetime_end,
				description
			FROM
				events
			WHERE
				timeline_id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result.rows)

		res.status(200);
		res.json(result.rows);
	} catch (err) {
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.get("/projects/:id/events", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			SELECT
				events.id,
				events.timeline_id,
				events.name_for_writer_reference,
				events.name_canon,
				events.datetime_start,
				events.datetime_end,
				events.description
			FROM
				events
			JOIN
				timelines ON timelines.id = events.timeline_id
			WHERE
				timelines.project_id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result.rows)

		res.status(200);
		res.json(result.rows);
	} catch (err) {
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.post("/events", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			INSERT INTO
				events (
					timeline_id,
					name_for_writer_reference,
					name_canon,
					datetime_start,
					datetime_end,
					description
				)
				VALUES (
					$1,
					$2,
					$3,
					$4,
					$5,
					$6
				);
		`;

		db.connect();
		const result = await db.query(sql, [req.body.timelineId, req.body.nameForWriterReference, req.body.nameCanon, req.body.datetimeStart, req.body.datetimeEnd, req.body.description]);
		console.log(result.rows)

		if (result.rowCount > 0) {
			res.status(201);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		if (err.message.includes("duplicate key value")) {
			res.status(400);
			res.send();
		} else {
			res.status(500);
			res.json({error: err.message || err});
		}
	} finally {
		db.end();
	}
});

app.put("/events", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			UPDATE
				events
			SET
				timeline_id = $2,
				name_for_writer_reference = $3,
				name_canon = $4,
				datetime_start = $5,
				datetime_end = $6,
				description = $7
			WHERE
				id = $1;
		`;

		db.connect();

		const result = await db.query(sql, [
			req.body.id,
			req.body.timelineId,
			req.body.nameForWriterReference,
			req.body.nameCanon,
			req.body.datetimeStart,
			req.body.datetimeEnd,
			req.body.description,
		]);

		console.log(result)

		if (result.rowCount > 0) {
			res.status(201);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		res.status(500);
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.delete("/events/:id", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			DELETE
			FROM
				events
			WHERE
				id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result);

		if (result.rowCount > 0) {
			res.status(204);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		res.status(500);
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.post("/events/characters", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			INSERT INTO
				characters_events (
					character_id,
					event_id
				)
				VALUES (
					$1,
					$2
				);
		`;

		db.connect();
		const result = await db.query(sql, [req.body.characterId, req.body.eventId]);
		console.log(result.rows);

		if (result.rowCount > 0) {
			res.status(201);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		if (err.message.includes("duplicate key value")) {
			res.status(400);
			res.send();
		} else {
			res.status(500);
			res.json({error: err.message || err});
		}
	} finally {
		db.end();
	}
});

app.delete("/events/:eventId/characters/:characterId", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			DELETE
			FROM
				characters_events
			WHERE
				event_id = $1
				AND
				character_id = $2;
		`;

		db.connect();
		const result = await db.query(sql, [
			req.params.eventId,
			req.params.characterId,
		]);
		console.log(result);

		if (result.rowCount > 0) {
			res.status(204);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		res.status(500);
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.get("/projects/:id/event-tags", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			SELECT
				id,
				project_id,
				parent_event_id,
				name,
				description
			FROM
				event_tags
			WHERE
				project_id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result.rows)

		res.status(200);
		res.json(result.rows);
	} catch (err) {
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.post("/event-tags", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			INSERT INTO
				event_tags (
					project_id,
					parent_event_id,
					name,
					description
				)
				VALUES (
					$1,
					$2,
					$3,
					$4
				);
		`;

		db.connect();
		const result = await db.query(sql, [req.body.projectId, req.body.parent_event_id, req.body.name, req.body.description]);
		console.log(result.rows)

		if (result.rowCount > 0) {
			res.status(201);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		if (err.message.includes("duplicate key value")) {
			res.status(400);
			res.send();
		} else {
			res.status(500);
			res.json({error: err.message || err});
		}
	} finally {
		db.end();
	}
});

app.put("/event-tags", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			UPDATE
				event_tags
			SET
				project_id = $2,
				parent_event_id = $3,
				name = $4,
				description = $5
			WHERE
				id = $1;
		`;

		db.connect();

		const result = await db.query(sql, [
			req.body.id,
			req.body.projectId,
			req.body.parentEventId,
			req.body.name,
			req.body.description,
		]);

		console.log(result)

		if (result.rowCount > 0) {
			res.status(201);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		res.status(500);
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.delete("/event-tags/:id", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			DELETE
			FROM
				event_tags
			WHERE
				id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result);

		if (result.rowCount > 0) {
			res.status(204);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		res.status(500);
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.get("/events/:id/event-tags", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			SELECT
				event_tags.id,
				event_tags.project_id,
				event_tags.parent_event_id,
				event_tags.name,
				event_tags.description
			FROM
				event_tags
			JOIN
				events_event_tags
			ON
				event_tags.id = events_event_tags.event_tag_id
			WHERE
				events_event_tags.event_id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result.rows)

		res.status(200);
		res.json(result.rows);
	} catch (err) {
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.get("/event-tags/:id/events", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			SELECT
				events.id,
				events.timeline_id,
				events.name_for_writer_reference,
				events.name_canon,
				events.datetime_start,
				events.datetime_end,
				events.description
			FROM
				events
			JOIN
				events_event_tags ON events.id = events_event_tags.event_id
			WHERE
				events_event_tags.event_tag_id = $1;
		`;

		db.connect();
		const result = await db.query(sql, [req.params.id]);
		console.log(result.rows)

		res.status(200);
		res.json(result.rows);
	} catch (err) {
		res.json({error: err.message || err});
	} finally {
		db.end();
	}
});

app.post("/events/event-tags", async (req, res) => {
	const db = getClient();

	try {
		const sql = `
			INSERT INTO
				events_event_tags (
					event_id,
					event_tag_id
				)
				VALUES (
					$1,
					$2
				);
		`;

		db.connect();
		const result = await db.query(sql, [req.body.eventId, req.body.eventTagId]);
		console.log(result.rows)

		if (result.rowCount > 0) {
			res.status(201);
		} else {
			res.status(400);
		}

		res.send();
	} catch (err) {
		if (err.message.includes("duplicate key value")) {
			res.status(400);
			res.send();
		} else {
			res.status(500);
			res.json({error: err.message || err});
		}
	} finally {
		db.end();
	}
});

app.listen(port, () => {
	console.log(`Server ready at http://localhost:${port}`);
});
