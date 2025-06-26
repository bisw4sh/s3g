import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

export type ExtendedSessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  profileUrl?: string;
  coverUrl?: string;
};

export type ExtendedSession = {
  user: ExtendedSessionUser;
};

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [adminClient()]
})

export const { signIn, signUp, useSession } = authClient
