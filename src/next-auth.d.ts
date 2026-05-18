import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
      isEmailVerified: boolean;
    } & DefaultSession["user"];
    accessToken: string;
    expiresAt: number;
    error?: string;
  }

  interface User extends DefaultUser {
    username?: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    isEmailVerified?: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    id?: string;
    username?: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    isEmailVerified?: boolean;
    error?: string;
  }
}
