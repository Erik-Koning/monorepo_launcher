import { createAuthClient } from "better-auth/react";

if (!process.env.NEXT_PUBLIC_BASE_URL) {
  console.error("NEXT_PUBLIC_BASE_URL is not set");
}

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});
