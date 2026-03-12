import NextAuth, { type DefaultSession, type DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      isEmailVerified: boolean;
    } & DefaultSession["user"];
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
  }

  interface User extends DefaultUser {
    username?: string;
    isEmailVerified?: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}

import { JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    id?: string;
    username?: string;
    isEmailVerified?: boolean;
    error?: string;
  }
}
