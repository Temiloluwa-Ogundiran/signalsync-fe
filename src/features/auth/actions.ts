"use server";

// TODO: Implement with NextAuth v5 Credentials provider
// These server actions will call the FastAPI backend for auth

export async function loginAction(email: string, password: string) {
  // const response = await api.post("/auth/login", { email, password });
  // return response.data;
  throw new Error("Not implemented");
}

export async function registerAction(
  name: string,
  email: string,
  password: string,
) {
  // const response = await api.post("/auth/register", { name, email, password });
  // return response.data;
  throw new Error("Not implemented");
}

export async function logoutAction() {
  // TODO: Clear session
  throw new Error("Not implemented");
}
