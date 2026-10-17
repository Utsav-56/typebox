import { Password } from "./password";
import { BetterAuthExtensionImplementation } from "./better_auth";

export type * from "./password";
export * from "./password";

// export interface AuthExtension {
//   Password: (options?: PasswordOptions) => TPassword;
// }

export const AuthExtensionImplementation = {
  Password,
  betterAuth: BetterAuthExtensionImplementation,
};

export type AuthExtension = typeof AuthExtensionImplementation;
export type * from "./better_auth";
export type * from "./password";
