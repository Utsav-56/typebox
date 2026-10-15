import {
  FormatRegistry,
  Type as TypeBoxBuilder,
  TypeRegistry,
} from "@sinclair/typebox";

import * as TypeBox from "@sinclair/typebox";

import {
  ValidationExtensionImplementation,
  type ValidationExtension,
} from "./src/validation";
import { DateExtensionImplementation, type DateExtension } from "./src/dates";
import {
  AuthExtensionImplementation,
  type AuthExtension,
} from "./src/auth_releted";
import {
  CoordinateExtensionImplementation,
  type CoordinateExtension,
} from "./src/coordinates";
import { FileExtensionImplementation, type FileExtension } from "./src/files";
import {
  NumberExtensionImplementation,
  type NumberExtension,
  type TNumeric,
} from "./src/numbers";
import {
  UtilsExtensionImplementation,
  type UtilsExtension,
} from "./src/util-types";
import {
  DataTypesExtensionImplementation,
  type DataTypesExtension,
} from "./src/data_types";

export type * from "@sinclair/typebox";

// destructure everything from TypeBox *except* Type
const { Type: _, ...RestOfValues } = TypeBox;

export { RestOfValues };

export { FormatRegistry, Kind, TypeRegistry } from "@sinclair/typebox";

export { Value } from "@sinclair/typebox/value";

export * from "./src/validation/error";

/**
 * ? Fork of ajv-formats without ajv as dependencies
 *
 * @see https://github.com/ajv-validator/ajv-formats/blob/master/src/formats.ts
 **/

const fullFormats = {
  // duration: https://tools.ietf.org/html/rfc3339#appendix-A
  duration:
    /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,

  "date-time":
    /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-][01]\d:[0-5]\d)?$/,

  date: /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/,

  // uri-template: https://tools.ietf.org/html/rfc6570
  "uri-template":
    // oxlint-disable-next-line no-control-regex
    /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
  // For the source: https://gist.github.com/dperini/729294
  // For test cases: https://mathiasbynens.be/demo/url-regex
  url: /^(?:https?|ftp):\/\/(?:[^\s:@]+(?::[^\s@]*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
  email:
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
  hostname:
    /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
  // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
  ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
  ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
  regex,
  // uuid: http://tools.ietf.org/html/rfc4122
  uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
  // JSON-pointer: https://tools.ietf.org/html/rfc6901
  // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
  "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
  "json-pointer-uri-fragment":
    /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
  // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
  "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
  // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
  // byte: https://github.com/miguelmota/is-base64
  byte,
  // signed 32 bit integer
  int32: { type: "number", validate: validateInt32 },
  // signed 64 bit integer
  int64: { type: "number", validate: validateInt64 },
  // C-type float
  float: { type: "number", validate: validateNumber },
  // C-type double
  double: { type: "number", validate: validateNumber },
  // hint to the UI to hide input strings
  password: true,
  // unchecked string payload
  binary: true,
} as const;

const BYTE =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;

function byte(str: string): boolean {
  BYTE.lastIndex = 0;
  return BYTE.test(str);
}

const MIN_INT32 = -(2 ** 31);
const MAX_INT32 = 2 ** 31 - 1;

function validateInt32(value: number): boolean {
  return Number.isInteger(value) && value <= MAX_INT32 && value >= MIN_INT32;
}

function validateInt64(value: number): boolean {
  // JSON and javascript max Int is 2**53, so any int that passes isInteger is valid for Int64
  return Number.isInteger(value);
}

function validateNumber(): boolean {
  return true;
}

const Z_ANCHOR = /[^\\]\\Z/;
function regex(str: string): boolean {
  if (Z_ANCHOR.test(str)) return false;
  try {
    new RegExp(str);
    return true;
  } catch (e) {
    return false;
  }
}

Object.entries(fullFormats).forEach((formatEntry) => {
  const [formatName, formatValue] = formatEntry;

  if (!FormatRegistry.Has(formatName)) {
    if (formatValue instanceof RegExp)
      FormatRegistry.Set(formatName, (value) => formatValue.test(value));
    else if (typeof formatValue === "function")
      FormatRegistry.Set(formatName, formatValue);
  }
});

if (!TypeRegistry.Has("File")) {
  TypeRegistry.Set(
    "File",
    (schema: Record<string, unknown>, value: unknown) => {
      const isFile =
        (typeof File !== "undefined" && value instanceof File) ||
        (typeof Blob !== "undefined" && value instanceof Blob);

      if (!isFile) return false;

      const file = value as File;

      // RHF Instant Feedback: Validate MIME type if specified in schema
      if (schema.type) {
        const allowedTypes = Array.isArray(schema.type)
          ? schema.type
          : [schema.type];
        if (!allowedTypes.includes(file.type)) return false;
      }

      // Backend Elysia compiler handles robust maxSize checks natively,
      // but it passes this `instanceof` check safely.
      return true;
    },
  );
}

if (!TypeRegistry.Has("Unsafe")) {
  TypeRegistry.Set("Unsafe", (_schema, value) => {
    if (typeof value !== "object" || value === null) return false;
    if (typeof File !== "undefined" && File.prototype.isPrototypeOf(value))
      return true;
    if (typeof Blob !== "undefined" && Blob.prototype.isPrototypeOf(value))
      return true;
    return true;
  });
}

// use the options directly from the elysia type system for the file schema
// to allow elyisa parses it perfectly and also to allow the typebox to parse it perfectly

export interface CustomExtensions
  extends
    ValidationExtension,
    DateExtension,
    AuthExtension,
    CoordinateExtension,
    FileExtension,
    NumberExtension,
    UtilsExtension,
    DataTypesExtension {}

export const t = Object.assign(
  {
    ...ValidationExtensionImplementation,
    ...DateExtensionImplementation,
    ...AuthExtensionImplementation,
    ...CoordinateExtensionImplementation,
    ...FileExtensionImplementation,
    ...NumberExtensionImplementation,
    ...UtilsExtensionImplementation,
    ...DataTypesExtensionImplementation,
  },
  TypeBoxBuilder,
) as typeof TypeBoxBuilder & CustomExtensions;

export type TType = typeof t;
