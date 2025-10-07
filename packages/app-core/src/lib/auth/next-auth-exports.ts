// packages/app-core/lib/auth-exports.ts

// Re-export the specific components/functions you need from next-auth/react
export { SessionProvider } from "next-auth/react";
export { useSession } from "next-auth/react"; // If you also need useSession in common
export { getSession } from "next-auth/react";
export { signIn, signOut } from "next-auth/react";
export { getToken } from "next-auth/jwt";
// Export any other specific exports from next-auth/react that common needs
export type * from "next-auth/jwt";
