import { Kind, type TSchema } from "@sinclair/typebox";
import type { Options, Transformed } from "../option";
import type { CsvOptions } from "./csv";
import { Registry } from "../type_registration";
import { Type as t } from "@sinclair/typebox";

export interface ProtocolLessUrlOptions extends Options {}

export interface UrlOptions extends ProtocolLessUrlOptions {
  allowProtocols?: Protocol[];
}

export interface TUrl extends Transformed<URL>, UrlOptions {
  [Kind]: "Url";
  static: URL;
  type: "string";
}

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

class UrlRegistry extends Registry<TUrl, URL, string> {
  validator(schema: TUrl, value: unknown): string | null {
    if (value === null || value === undefined) {
      return "This field cannot be null or undefined";
    }

    if (value instanceof URL) {
      return null;
    }

    if (typeof value !== "string") {
      return `Invalid value, expected a URL string but received ${JSON.stringify(value)}`;
    }

    try {
      const transFormed = this.parse(value);

      if (
        schema.allowProtocols &&
        !schema.allowProtocols.includes(
          transFormed.protocol.replace(":", "") as Protocol,
        )
      ) {
        return `Invalid protocol, expected one of ${schema.allowProtocols.join(", ")} but received ${transFormed.protocol.replace(":", "")}`;
      }
    } catch (e) {
      return (e as Error).message;
    }

    return null;
  }

  encode(value: URL): string {
    return value.toString();
  }

  parse(value: unknown): URL {
    if (value instanceof URL) {
      return value;
    }

    if (typeof value !== "string") {
      throw new Error(
        `Invalid value, expected a URL string but received ${JSON.stringify(value)}`,
      );
    }

    return new URL(value);
  }
}

const urlRegistry = new UrlRegistry("Url");

function Url(options?: UrlOptions): TUrl {
  const schema: TSchema = {
    [Kind]: "Url",
    type: "string",
    static: URL,
    params: [],
    format: "date-time",
    ...options,
  };

  return t
    .Transform(t.Unsafe(schema))
    .Decode(urlRegistry.parse.bind(urlRegistry))
    .Encode(urlRegistry.encode.bind(urlRegistry)) as TUrl;
}

function PostgresUrl(options?: ProtocolLessUrlOptions): TUrl {
  return Url({
    ...options,
    allowProtocols: ["postgres", "postgresql"],
  });
}

function SecureWebUrl(options?: ProtocolLessUrlOptions): TUrl {
  return Url({
    ...options,
    allowProtocols: ["https", "wss"],
  });
}

function WebUrl(options?: ProtocolLessUrlOptions): TUrl {
  return Url({
    ...options,
    allowProtocols: ["http", "https", "ws", "wss"],
  });
}

export const UrlExtensionImplementation = {
  Url,
  PostgresUrl,
  SecureWebUrl,
  WebUrl,
};

export type UrlExtension = typeof UrlExtensionImplementation;
