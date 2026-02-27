import {
  CookieSignInPayload,
  CookieSignUpPayload,
} from "@auth/services/cookies/CookieAuthProvider";
import { User } from "@auth/user";
import { FuseAuthProviderState } from "@fuse/core/FuseAuthProvider/types/FuseAuthTypes";
import { createContext } from "react";

export type CookieAuthContextType = FuseAuthProviderState<User> & {
  signIn?: (credentials: CookieSignInPayload) => Promise<Response>;
  signUp?: (U: CookieSignUpPayload) => Promise<Response>;
  signOut?: () => void;
  updateUser?: (user: User) => Promise<User>;
  verifyEmail?: (email: string, code: string) => Promise<Response>;
  forgotPassword?: (email: string) => Promise<Response>;
  resetPassword?: (
    email: string,
    code: string,
    password: string,
  ) => Promise<Response>;
};

const defaultAuthContext: CookieAuthContextType = {
  authStatus: "configuring",
  isAuthenticated: false,
  user: null,
  signIn: null,
  signUp: null,
  signOut: null,
  updateUser: null,
  verifyEmail: null,
  forgotPassword: null,
  resetPassword: null,
};

const CookieAuthContext =
  createContext<CookieAuthContextType>(defaultAuthContext);

export default CookieAuthContext;
