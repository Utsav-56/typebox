import { type TSchema, Kind, TypeRegistry } from "@sinclair/typebox";
import { DefaultErrorFunction, SetErrorFunction } from "@sinclair/typebox/errors";

import type { Options } from "./options";

// 1. Cleaned & expanded list of real-world valid URL schemes/protocols
export const protocols = [
	"http",
	"https",
	"ftp",
	"ftps",
	"sftp",
	"ssh",
	"file",
	"mailto",
	"tel",
	"sms",
	"ws",
	"wss",
	"git",
	"mongodb",
	"mongodb+srv",
	"redis",
	"rediss",
	"postgres",
	"postgresql",
	"mysql",
	"mariadb",
	"sqlite",
	"couchdb",
	"amqp",
	"amqps",
	"mqtt",
	"mqtts",
	"ldap",
	"ldaps",
	"rtmp",
	"rtsp",
	"urn",
] as const;

export type Protocol = (typeof protocols)[number];

export type StringChecker = string | string[] | RegExp;
export type NumberChecker = number | number[];

export interface UrlOptions extends Options {
	acceptedProtocols?: Protocol[] | RegExp;
	hostname?: StringChecker;
	port?: NumberChecker;
	pathname?: StringChecker;
	search?: StringChecker;
	hash?: StringChecker;
}

export interface TUrl extends TSchema {
	[Kind]: "Url";
	options: UrlOptions;
	static: string;
	type: "string";
}

// Helper to evaluate string constraints (direct match, list, or regex)
function checkString(value: string, checker: StringChecker | undefined): boolean {
	if (checker === undefined) return true;
	if (typeof checker === "string") return value === checker;
	if (Array.isArray(checker)) return checker.includes(value);
	if (checker instanceof RegExp) return checker.test(value);
	return false;
}

// Helper to evaluate numeric constraints (direct match or list)
function checkNumber(value: number, checker: NumberChecker | undefined): boolean {
	if (checker === undefined) return true;
	if (typeof checker === "number") return value === checker;
	if (Array.isArray(checker)) return checker.includes(value);
	return false;
}

/**
 * Validates a string URL against constraints.
 * Returns null if valid, or a descriptive string literal token if validation fails.
 *
 * @param value
 * @param options
 * @returns
 */
function getUrlValidationError(value: unknown, options: UrlOptions): string | null {
	if (typeof value !== "string") return "NOT_A_STRING";

	let url: URL;
	try {
		url = new URL(value);
	} catch {
		return "INVALID_URL_STRUCTURE";
	}

	const acceptedProtocols = options.acceptedProtocols;
	if (acceptedProtocols !== undefined) {
		// url.protocol includes the trailing colon (e.g., 'https:')
		const parsedProtocol = url.protocol.replace(/:\$/, "");

		if (acceptedProtocols instanceof RegExp) {
			if (!acceptedProtocols.test(parsedProtocol)) return "INVALID_PROTOCOL";
		} else if (Array.isArray(acceptedProtocols)) {
			if (!acceptedProtocols.includes(parsedProtocol as Protocol)) return "INVALID_PROTOCOL";
		}
	}

	if (options.hostname !== undefined && !checkString(url.hostname, options.hostname)) {
		return "INVALID_HOSTNAME";
	}

	if (options.port !== undefined) {
		// Native url.port defaults to an empty string if standard for the protocol
		const parsedPort = url.port ? parseInt(url.port, 10) : NaN;
		if (!checkNumber(parsedPort, options.port)) return "INVALID_PORT";
	}

	if (options.pathname !== undefined && !checkString(url.pathname, options.pathname)) {
		return "INVALID_PATHNAME";
	}

	if (options.search !== undefined && !checkString(url.search, options.search)) {
		return "INVALID_SEARCH";
	}

	if (options.hash !== undefined && !checkString(url.hash, options.hash)) {
		return "INVALID_HASH";
	}

	return null; // Valid
}

// Register the TypeBox Validator
TypeRegistry.Set<string>("Url", (schema: unknown, value: unknown) => {
	const opts = (schema as TUrl).options || {};
	return getUrlValidationError(value, opts) === null;
});

// Configure Descriptive Error Generation
SetErrorFunction((error) => {
	if (error.schema[Kind] === "Url") {
		const opts = (error.schema as TUrl).options || {};
		const reasonCode = getUrlValidationError(error.value, opts);

		switch (reasonCode) {
			case "NOT_A_STRING":
				return "Expected a string representing a valid URL";
			case "INVALID_URL_STRUCTURE":
				return "The string is not a well-formed, absolute URL";
			case "INVALID_PROTOCOL": {
				const protocolsText =
					opts.acceptedProtocols instanceof RegExp
						? opts.acceptedProtocols.toString()
						: JSON.stringify(opts.acceptedProtocols);
				return `URL scheme/protocol is not allowed. Permitted: ${protocolsText}`;
			}
			case "INVALID_HOSTNAME":
				return `URL hostname constraint failed matching criteria: ${JSON.stringify(opts.hostname)}`;
			case "INVALID_PORT":
				return `URL port constraint failed matching criteria: ${JSON.stringify(opts.port)}`;
			case "INVALID_PATHNAME":
				return `URL pathname layout does not match expected pattern: ${JSON.stringify(opts.pathname)}`;
			case "INVALID_SEARCH":
				return `URL query string parameters do not match constraint rule: ${JSON.stringify(opts.search)}`;
			case "INVALID_HASH":
				return `URL fragment anchor hash does not match constraint rule: ${JSON.stringify(opts.hash)}`;
			default:
				return "Malformed URL schema validation error";
		}
	}

	return DefaultErrorFunction(error);
});

// Constructible Function Factory
export function Url(options?: UrlOptions): TUrl {
	return {
		[Kind]: "Url",
		type: "string",
		options: options || {},
	} as unknown as TUrl;
}

export type ProtocolLessUrl = Omit<UrlOptions, "acceptedProtocols">;

export function WebUrl(options?: ProtocolLessUrl) {
	return Url({ ...options, acceptedProtocols: ["http", "https"] });
}

export function PgUrl(options?: ProtocolLessUrl) {
	return Url({ ...options, acceptedProtocols: ["postgres", "postgresql"] });
}

export function MongoDbUrl(options?: ProtocolLessUrl) {
	return Url({ ...options, acceptedProtocols: ["mongodb", "mongodb+srv"] });
}

export function RedisUrl(options?: ProtocolLessUrl) {
	return Url({ ...options, acceptedProtocols: ["redis", "rediss"] });
}

export function SftpUrl(options?: ProtocolLessUrl) {
	return Url({ ...options, acceptedProtocols: ["sftp"] });
}

export function SshUrl(options?: ProtocolLessUrl) {
	return Url({ ...options, acceptedProtocols: ["ssh"] });
}

export interface CustomExtensions {
	WebUrl: (options?: ProtocolLessUrl) => TUrl;
	PgUrl: (options?: ProtocolLessUrl) => TUrl;
}
