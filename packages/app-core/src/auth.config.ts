import Email from "next-auth/providers/nodemailer";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import { isDevEnv } from "@/packages/common/src/utils/environments";

// Notice this is only an object, not a full Auth.js instance
export default {
  //adapter: PrismaAdapter(prisma), //WORKAROUND FOR EDGE RUNTIME, PRISMA ADAPTER IS NOT EDGE COMPATIBLE
  providers: [],
  pages: {
    signIn: "/signin",
    signOut: "/signout",
    //error: '/auth/error', // Error code passed in query string as ?error=
    //verifyRequest: '/auth/verify-request', // (used for check email message)
    //newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  debug: isDevEnv(),
  /*
  session: {
    // Choose how you want to save the user session.
    // The default is `"jwt"`, an encrypted JWT (JWE) stored in the session cookie.
    // If you use an `adapter` however, we default it to `"database"` instead.
    // You can still force a JWT session by explicitly defining `"jwt"`.
    // When using `"database"`, the session cookie will only contain a `sessionToken` value,
    // which is used to look up the session in the database.
    strategy: "database",

    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 30 * 24 * 60 * 60, // 30 days

    // Seconds - Throttle how frequently to write to database to extend a session.
    // Use it to limit write operations. Set to 0 to always update the database.
    // Note: This option is ignored if using JSON Web Tokens
    updateAge: 24 * 60 * 60, // 24 hours

    // The session token is usually either a random UUID or string, however if you
    // need a more customized session token string, you can define your own generate function.
    //generateSessionToken: () => {
    //  return randomUUID?.() ?? randomBytes(64).toString("hex");
    //};
  },
  */
  //Need to use jwt strategy to get the token until database strategy works with middleware
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 12, // 12 hours
  },

  jwt: {
    // The maximum age of the NextAuth.js issued JWT in seconds.
    // Defaults to `session.maxAge`.
    // You can define your own encode/decode functions for signing and encryption
    //async encode() {},
    //async decode() {},
  },
  callbacks: {
    /*async jwt({ token, account, profile, session, trigger, user }) {
      console.log("CALLBACK JWT", account, profile, session, trigger, user);
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, user, newSession, token, trigger }) {
      console.log("CALLBACK SESSION", session, user, newSession, token, trigger);
      return session;
    },*/
    /*async redirect({ url, baseUrl }) {
      console.log("redirect", url, baseUrl);
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (url && typeof url === "string" && new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    */
    //  async jwt({ token, user, account, profile, isNewUser }) {
    //    ////console.log("CALLBACK", account, profile);
    //    return token;
    //  },
    //  async session({ session, token, user }) {
    //    ////console.log("CALLBACK", user);
    //    return session;
    //  },
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
