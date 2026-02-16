export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Session {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}
