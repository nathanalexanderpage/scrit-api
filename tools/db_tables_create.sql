CREATE TABLE IF NOT EXISTS projects (
	id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	name varchar NOT NULL UNIQUE,
	description text NULL,
	created_at timestamptz NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS project_notes (
	id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	project_id int NOT NULL REFERENCES projects(id),
	name varchar NOT NULL UNIQUE,
	content text NULL,
	created_at timestamptz NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
	modified_at timestamptz NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS timelines (
	id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	project_id int NOT NULL REFERENCES projects(id),
	name varchar NOT NULL UNIQUE,
	description text NULL
);

CREATE TABLE IF NOT EXISTS locations_meta (
	id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	project_id int NOT NULL REFERENCES projects(id),
	name varchar NOT NULL UNIQUE,
	description text NULL
);

CREATE TABLE IF NOT EXISTS locations (
	id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	meta_location_id int NOT NULL REFERENCES locations_meta(id),
	name_for_writer_reference varchar NULL UNIQUE,
	name_canon varchar NULL,
	description text NULL
);

CREATE TABLE IF NOT EXISTS characters_meta (
	id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	project_id int NOT NULL REFERENCES projects(id),
	name varchar NOT NULL UNIQUE,
	description text NULL
);

CREATE TABLE IF NOT EXISTS characters (
	id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	meta_character_id int NOT NULL REFERENCES characters_meta(id),
	name_for_writer_reference varchar NULL UNIQUE,
	name_given varchar NULL,
	name_goes_by varchar NULL,
	description text NULL,
	birthyear int NULL,
	birthplace varchar
	-- hometown varchar,
	-- gender varchar NULL,
	-- education text NULL,
	-- training text NULL,
	-- appearance text NULL,
	-- aspirations text NULL,
	-- hobbies text NULL,
	-- habits text NULL,
	-- allegiances text NULL,
);

CREATE TABLE IF NOT EXISTS events (
	id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	timeline_id int NOT NULL REFERENCES timelines(id),
	name_for_writer_reference varchar NULL UNIQUE,
	name_canon varchar NULL,
	datetime_start timestamptz NULL,
	datetime_end timestamptz NULL,
	description text NULL
);

CREATE TABLE IF NOT EXISTS event_tags (
	id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	parent_event_id int NULL REFERENCES events(id),
	name varchar NOT NULL UNIQUE,
	description varchar NULL
);

CREATE TABLE IF NOT EXISTS events_event_tags (
	event_id int NOT NULL REFERENCES events(id),
	event_tag_id int NOT NULL REFERENCES event_tags(id),
	PRIMARY KEY (event_id, event_tag_id)
);

CREATE TABLE IF NOT EXISTS characters_events (
	character_id int NOT NULL REFERENCES characters(id),
	event_id int NOT NULL REFERENCES events(id),
	PRIMARY KEY (character_id, event_id)
);
