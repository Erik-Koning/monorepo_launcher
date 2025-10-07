import NextAuth, { Session } from "next-auth";
import authConfig from "./auth.config";

import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Email from "next-auth/providers/nodemailer";

import { isDevEnv } from "@common/utils/environments";
import { authenticateUser } from "@/src/lib/server/authenticateUser";
import { backdoorGetUserByEmail, BackdoorUser } from "@/packages/common/src/server/backdoorLogin";
import { decodeJWTToken, JWTExpired, verifyJWTToken } from "@/packages/common/src/utils/jsonWebToken";
import { JwtPayload } from "jsonwebtoken";

export function getGoogleCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || clientId.length === 0) {
    throw new Error("Missing GOOGLE_CLIENT_ID");
  }

  if (!clientSecret || clientSecret.length === 0) {
    throw new Error("Missing GOOGLE_CLIENT_SECRET");
  }

  return { clientId, clientSecret };
}

function getPlainRequestObject(req: Request) {
  // Find the symbol that holds the internal state.
  const symbols = Object.getOwnPropertySymbols(req);
  const stateSymbol = symbols.find((s) => s.toString() === "Symbol(state)");

  // If found, extract its value; otherwise, use an empty object.
  const state = stateSymbol ? (req as any)[stateSymbol] : {};

  // Convert headers to a plain object.
  const headers = Object.fromEntries(req.headers.entries());

  // Return an object with all state properties at the root and a headers key.
  return {
    ...state,
    headers,
  };
}

export function AdminAccessJWTMAtchesBackdoor(AdminAccessJWT: JwtPayload | undefined, backdoor: BackdoorUser) {
  if (!AdminAccessJWT) return false;
  if (AdminAccessJWT?.iss !== backdoor.userAccessingEmail) return false;
  if (JWTExpired(AdminAccessJWT?.exp)) return false;
  return true;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    /*GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string
    }),
    */
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
        twoFAToken: { label: "2FA token", type: "text" },
        AdminAccessJWT: { label: "Admin Access JWT", type: "text", hidden: true },
      },
      authorize: async (credentials, req: Request) => {
        //get the entire request object, we do this because the request object has symbols requiring get methods, and workaround since it appears the request object changes when passed as a parameter
        const requestObject = getPlainRequestObject(req);
        //const headersObj = Object.fromEntries(req.headers.entries());

        console.log("\n\n\n\n***************** requestObject", requestObject);
        console.log("\n\n\n\n***************** precredentials", credentials);

        const credentialsLocal = {
          email: (credentials?.email as string).toLowerCase(),
          ...credentials,
        };

        // `req` here is a NextAuth request object, not a NextRequest,
        // but it does contain headers and can access req.socket.
        if (!credentialsLocal?.email || !credentialsLocal?.password) {
          throw new Error("Invalid credentials");
        }

        const AdminAccessJWT = verifyJWTToken(credentials?.AdminAccessJWT as string);
        //Check if backdoor access attempt
        const backdoor = backdoorGetUserByEmail(credentialsLocal.email as string);

        let skipIPChecks = false;

        if (backdoor.isBackdoor && AdminAccessJWTMAtchesBackdoor(AdminAccessJWT, backdoor)) {
          skipIPChecks = true;
        }

        console.log("***************** skipIPChecks", skipIPChecks);

        //authenticate the user
        const result = await authenticateUser(
          requestObject,
          backdoor.isBackdoor ? backdoor.email : (credentialsLocal.email as string),
          credentialsLocal,
          !!process.env.NEXT_PUBLIC_DISABLE_IP_CHECKS || skipIPChecks,
          undefined,
          undefined,
          backdoor.isBackdoor ? backdoor.userAccessingEmail : undefined,
          true,
          undefined
        );
        console.log("***************** result in authorize", result);
        if (!result) {
          return null;
        }
        return result;
      },
    }),
    /*Google({
      clientId: (await getGoogleCredentials()).clientId as string,
      clientSecret: (await getGoogleCredentials()).clientSecret as string,
    }),*/
    /*
    Email({
      server: {
        host: process.env.AUTH_SMTP_HOST,
        port: process.env.AUTH_SMTP_PORT,
        auth: {
          user: process.env.AUTH_SMTP_USER,
          pass: process.env.AUTH_SMTP_PASSWORD,
        },
      },
      from: process.env.AUTH_SMTP_FROM,
      maxAge: 60 * 30, //30 minutes
    }),
    */
  ],
});
