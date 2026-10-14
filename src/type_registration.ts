import { Kind, TypeRegistry, type TSchema } from "@sinclair/typebox";
import {
  DefaultErrorFunction,
  SetErrorFunction,
} from "@sinclair/typebox/errors";

export abstract class Registry<
  Sc extends TSchema,
  Parsed = unknown,
  Encoded = Parsed,
> {
  private static readonly registries = new Map<
    string,
    // oxlint-disable-next-line typescript/no-explicit-any
    Registry<any, any, any>
  >();

  private static isErrorHookInitialized = false;

  private readonly kind: string;

  constructor(kind: string) {
    this.kind = kind;

    if (!Registry.registries.has(kind)) {
      Registry.registries.set(kind, this);
    }

    this.SetValidator();
    this.initGlobalError();
  }

  /**
   *
   * Decodes the incoming value into the desired type.
   * This method should be implemented by subclasses to handle specific decoding logic based on the schema.
   *
   * @param value the incoming value to parse
   */
  abstract parse(value: unknown): Parsed;

  /**
   * encodes the parsed value back into a format suitable for output or storage.
   *
   * This method should be implemented by subclasses to handle specific encoding logic based on the schema.
   *
   * in other words think of it as outgoing data
   *
   * @param value the value to send back
   */
  abstract encode(value: Parsed): Encoded;

  /**
   * Validates the incoming value against the provided schema.
   * This method should be implemented by subclasses to handle specific validation logic based on the schema.
   *
   * @param schema the schema to validate against
   * @param value the value to validate
   * @returns a string containing an error message if validation fails, or null if validation succeeds
   */
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
        console.log(`inside SetValidator for kind: ${this.kind}`);
        return this.validate(schema, value) === null;
      });
    }
  }

  private initGlobalError() {
    if (Registry.isErrorHookInitialized) return;
    Registry.isErrorHookInitialized = true;

    console.log(
      "Initializing global error hook for TypeBox validation errors.",
    );

    SetErrorFunction((error) => {
      const kind = error.schema?.[Kind];

      console.log("Error Schema Kind:", kind);

      if (typeof kind === "string") {
        const registry = Registry.registries.get(kind);
        if (registry) {
          const customMessage = registry.validate(error.schema, error.value);
          if (customMessage !== null) {
            return customMessage;
          }
        }
      }

      console.log(
        "falling back to default error function for TypeBox validation errors.",
      );
      return DefaultErrorFunction(error);
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
