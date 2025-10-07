"use server";

import { cache } from "react";

//export const revalidate = 1;

/******************
next-auth provides a simple and convenient way to manage user sessions and authentication, but it's important to understand its limitations and security considerations.

The useSession and getServerSideSession hook provided by next-auth/react fetches the user session data from the server, the session data is stored on the server, not on the client side. This makes it more secure compared to storing session data in a client-side cookie, as users cannot directly modify the session data.

However, it's important to keep in mind a few points:
- Server-Side Data: The session data is managed by the server, and the session tokens (which match a user session obj) are stored in an HTTP-only secure cookie on the client. This means the user cannot directly tamper with the session data via the client side.
- Token-based Security: The session is authenticated and validated using tokens, and the tokens are signed and verified using server-side keys. This makes it difficult for users to manipulate the session data.
- CSRF Protection: next-auth provides built-in CSRF protection, which helps prevent cross-site request forgery attacks.
- Always Validate: Even though next-auth handles session data securely, you should still validate user permissions and roles on the server side when accessing sensitive data or performing actions. Don't rely solely on the session data to determine user access.
- Sensitive Data: Avoid storing sensitive data directly in the session. Instead, store minimal user-related information and use server-side APIs to access sensitive data when needed.
- Token Expiry: Be aware of token expiry and refresh mechanisms provided by next-auth. Tokens can expire, and refresh tokens can be used to obtain new tokens without exposing user credentials.

Also necessary to validate user permissions server side. Some users, even though they are authenticated, do not have permission to do all functions.
******************/

import { auth } from "@/src/auth";

export async function getServerSideSession() {
  return await auth();
}

// used to get the current user from the session. This date is set in redux state as "userData" obj in the redux slice "userSlice"
export default async function getCurrentUser(): Promise<Record<string,any> | null> {
  try {
    const session = await getServerSideSession();

    if (!session?.user?.email) {
      return null;
    }

    const currentUser = {name: "John Doe", email: session.user.email as string, office: {name: "Office 1"}};

    if (!currentUser) {
      return null;
    }

    return currentUser;
  } catch (error: any) {
    return null;
  }
}

//TODO how can we make this not callable by the client?
export const getCurrentUserServerSide = cache(async (): Promise<Record<string,any> | null> => {
  const user = await getServerSideSession();
  //I did not see a way to get expiry here?

  if (!user || !user?.user?.email) return null;
  let userInfo: Record<string,any> | null = {name: "John Doe", email: user.user.email as string, office: {name: "Office 1"}};

  if (!userInfo) return null;

  return userInfo;
});
