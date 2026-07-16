import type { DefaultSession, DefaultUser } from "next-auth";

export type PlatformRole = "user" | "admin" | "technical_admin" | "super_admin";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      displayName: string | null;
      avatarUrl: string | null;
      isEmailVerified: boolean;
      onboardingCompleted: boolean;
      platformRole: PlatformRole;
    } & DefaultSession["user"];
    accessToken: string;
    expiresAt: number;
    error?: string;
  }

  interface User extends DefaultUser {
    displayName?: string | null;
    avatarUrl?: string | null;
    isEmailVerified?: boolean;
    onboardingCompleted?: boolean;
    platformRole?: PlatformRole;
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
    displayName?: string | null;
    avatarUrl?: string | null;
    isEmailVerified?: boolean;
    onboardingCompleted?: boolean;
    platformRole?: PlatformRole;
    error?: string;
  }
}
