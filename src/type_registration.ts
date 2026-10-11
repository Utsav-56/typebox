import { Kind, TypeRegistry, type TSchema } from "@sinclair/typebox";
import {
  DefaultErrorFunction,
  SetErrorFunction,
  type ErrorFunction,
} from "@sinclair/typebox/errors";

type RegistryValidator<Sc extends TSchema> = (
  schema: Sc,
  value: unknown,
) => string | null;

export abstract class Registry<
  Sc extends TSchema,
  Parsed = unknown,
  Encoded = Parsed,
> {
  private readonly kind: string;

  constructor(kind: string) {
    this.kind = kind;

    this.SetValidator();
    this.SetError();
  }

  abstract parse(value: unknown): Parsed;

  abstract encode(value: Parsed): Encoded;

  abstract validator(schema: Sc, value: unknown): string | null;

  private validate(schema: unknown, value: unknown): string | null {
    const validatedSchema = this.validateSchema(schema);
    if (validatedSchema === null) {
      console.error(
        `Schema validation failed for kind '${this.kind}'. The schema provided by typebox is not valid for our registration`,
      );
      return `Schema validation failed for kind '${this.kind}'. The schema provided by typebox is not valid for our registration`;
    }

    return this.validator(validatedSchema, value);
  }

  private SetValidator() {
    if (!TypeRegistry.Has(this.kind)) {
      TypeRegistry.Set(this.kind, (schema: unknown, value: unknown) => {
        return this.validate(schema, value) === null;
      });
    }
  }

  private SetError() {
    SetErrorFunction((error) => {
      if (!(error.schema[Kind] === this.kind)) {
        return DefaultErrorFunction(error);
      }

      const message = this.validate(error.schema, error.value);
      if (message === null) {
        return DefaultErrorFunction(error);
      }

      return message;
    });
  }

  private validateSchema(schema: unknown): Sc | null {
    if (typeof schema !== "object" || schema === null) {
      return null;
    }

    if ((schema as TSchema)[Kind] !== this.kind) {
      return null;
    }

    return schema as Sc;
  }
}
