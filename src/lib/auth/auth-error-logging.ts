export function isExpectedAuthFlowError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "type" in error &&
    error.type === "CredentialsSignin"
  );
}
