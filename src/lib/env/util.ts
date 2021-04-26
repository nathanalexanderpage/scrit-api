export function getEnvVar(key: string): string {
	if (typeof process.env[key] === 'undefined') {
		throw new Error(`Missing environment variable: ${key}`);
	}

	return process.env[key] as string;
}
