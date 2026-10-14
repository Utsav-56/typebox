import { Password, type PasswordOptions, type TPassword } from "./password";

export type * from "./password";
export * from "./password";

// export interface AuthExtension {
//   Password: (options?: PasswordOptions) => TPassword;
// }

export const AuthExtensionImplementation = {
  Password,
};

export type AuthExtension = typeof AuthExtensionImplementation;
