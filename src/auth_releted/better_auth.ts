import type { Static, TSchema } from "@sinclair/typebox";
import { Password, type PasswordOptions } from "./password";
import { Type as t } from "@sinclair/typebox";
import { ImageFile, type ImageFileOptions } from "../files";

export interface SignupOptions<T extends TSchema[] = TSchema[]> {
  password?: PasswordOptions;
  imageOptions?: ImageFileOptions;
  composites?: [...T]; // Force TypeScript to treat this as a tuple
}

const emailSchema = t.String({
  description: "User's email address",
  format: "email",
  examples: ["anakin@gmail,com", "thor@avengers.com"],
});

const redirect = (description: string) =>
  t.String({
    format: "url",
    description,
    examples: ["https://example.com/reset-password"],
  });

function SignupSchema<T extends TSchema[]>(options?: SignupOptions<T>) {
  const baseSchema = t.Object({
    password: Password(options?.password),
    email: emailSchema,
    image: t.Optional(ImageFile(options?.imageOptions)),
  });

  const composites = (options?.composites ?? []) as [...T];

  return t.Composite([baseSchema, ...composites]);
}

const composites = [
  t.Object({
    name: t.String({
      minLength: 3,
      description: "The name of the user",
    }),
  }),

  t.Object({
    role: t.String({
      description: "The role of the user",
      examples: ["admin", "user", "moderator"],
    }),
  }),

  t.Object({
    banned: t.Boolean({
      description: "Whether the user is banned or not",
    }),
  }),
];

const checkType = SignupSchema({ composites });

export type TCheckType = Static<typeof checkType>;

export type TSignup = Static<ReturnType<typeof SignupSchema>>;

function LoginSchema<T extends TSchema[]>(options?: SignupOptions<T>) {
  const baseSchema = t.Object({
    password: Password(options?.password),
    email: emailSchema,
  });

  const composites = (options?.composites ?? []) as [...T];

  return t.Composite([baseSchema, ...composites]);
}

export type TLogin = Static<ReturnType<typeof LoginSchema>>;

export const ChangePassword = t.Object({
  newPassword: t.String({
    minLength: 8,
    description: "The new password of the user",
  }),
  currentPassword: t.String({
    description: "The current password of the user",
  }),
  revokeOtherSessions: t.Boolean({
    default: false,
    description:
      "Whether to revoke all other sessions for the user, if true then all the existing devices will be automatically logged out and will require the user to login again",
  }),
});

export const RequestResetPassword = t.Object({
  email: emailSchema,
  redirectTo: redirect(
    "The URL to redirect the user after they have successfully reset their password. This is usually a page where the user can set a new password.",
  ),
});

export const ResetPassword = t.Object({
  newPassword: t.String({
    minLength: 8,
    description: "The new password of the user",
  }),
  token: t.String({
    description:
      "The token sent to the user's email for resetting the password",
  }),
});

export const ChangeEmail = t.Object({
  newEmail: emailSchema,
  currentPassword: t.String({
    description: "The current password of the user",
  }),
});

export const SendVerificationEmail = t.Object({
  email: emailSchema,
  callbackURL: t.Optional(
    redirect(
      "The URL to redirect the user after they have successfully verified their email.",
    ),
  ),
});

export const BetterAuthExtensionImplementation = {
  // SignupSchema,
  // LoginSchema,
  ChangePassword,
  RequestResetPassword,
  ResetPassword,
  ChangeEmail,
  SendVerificationEmail,
};

export type BetterAuthExtension = typeof BetterAuthExtensionImplementation;
