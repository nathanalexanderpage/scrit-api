import * as dotenv from "dotenv";
import * as path from "path";
import { getEnvVar } from "./lib/env";

dotenv.config({ path: path.join(process.cwd(), '.env') });

export const env = {
	db: {
		host: getEnvVar('DB_HOST'),
		port: parseInt(getEnvVar('DB_PORT')),
		username: getEnvVar('DB_USERNAME'),
		password: getEnvVar('DB_PASSWORD'),
		adminUsername: getEnvVar('DB_USERNAME_ADMIN'),
		adminPassword: getEnvVar('DB_PASSWORD_ADMIN'),
		database: getEnvVar('DB_DATABASE'),
		defaultDatabase: getEnvVar('DB_DATABASE_DEFAULT'),
	},
};
