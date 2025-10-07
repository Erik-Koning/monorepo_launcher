import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
//import { auth } from "./auth";

import NextAuth, { NextAuthResult, Session } from "next-auth";
import authConfig from "./auth.config";
import { NextApiRequest } from "next";
import { AppRouteHandlerFn } from "next/dist/server/route-modules/app-route/module";
import { getReqCountry } from "@/packages/common/src/server/apiRequests";
import { isDevEnv } from "@/packages/common/src/utils/environments";

// Create a Redis client for rate limiting
//const redis = new Redis({
//  url: process.env.REDIS_URL,
//  token: process.env.REDIS_SECRET,
//})

// Create a rate limiter using Upstash Ratelimit library
//const ratelimit = new Ratelimit({
//  redis: redis,
//  limiter: Ratelimit.slidingWindow(50, '1 h'),
//})

//Middleware by default runs in the Edge runtime, which is limited in functionality compared to Node.js runtime.
//TODO keep an eye on experimemental use of Node.js in Edge runtime https://nextjs.org/docs/app/building-your-application/routing/middleware#runtime

// Prisma Adapter is not edge compatible, so we use the authconfig that omits the prisma adapter - more here: https://github.com/nextauthjs/next-auth/issues/9300
//importing { auth } from "./auth" would not work in edge runtime,
//instantiate the auth middleware as workaround for edge runtime https://authjs.dev/guides/edge-compatibility
const authjs = NextAuth(authConfig);

// The following is how we extract the types of the authjs.auth function, to get the type of the parameters
// Extracting the overloaded type of req from the authjs.auth function, we pass the type of auth and infer the type of req
type ExtractAuthReq<T> = T extends (callback: (req: infer R, ctx: any) => any) => any ? R : never;
export type AuthRequest = ExtractAuthReq<NextAuthResult["auth"]>;

// Extracting the overloaded type of ctx from the authjs.auth function, we pass the type of auth and infer the type of ctx
type ExtractContext<T> = T extends (callback: (req: any, ctx: infer C) => any) => any ? C : never;
export type AppRouteHandlerFnContext = ExtractContext<NextAuthResult["auth"]>;

export function sessionIsValid(session?: Session | null) {
  return !!session && session.expires && new Date(session.expires) > new Date();
}

// The middleware function is defined to handle incoming requests (NextRequest).
// It retrieves the pathname of the request to understand which route is being accessed.
// It checks for user authentication by trying to get a token. If a token is found (!!token), it implies that the user is authenticated.
// The middleware determines whether the current path is an authentication page (/signin, /try) or a sensitive route that requires authentication (like /entries and /).
export default async function middleware(req: NextRequest, ctx: AppRouteHandlerFnContext) {
  // Call auth.js to augment the request
  const response = await authjs.auth(async (req: AuthRequest, ctx: AppRouteHandlerFnContext) => {
    // Check if user is authenticated
    const userHasSession = sessionIsValid(req.auth);

    const skipMiddleware = true || process.env.SKIP_MIDDLEWARE === "true";
    if (skipMiddleware) {
      return NextResponse.next();
    }

    const url = req.nextUrl;
    const currentUrl = req.referrer;
    const targetUrl = req.nextUrl.href;
    const targetPath = url.pathname;
    let isRedirect = false;

    console.log("targetUrl", targetUrl);
    console.log("currentUrl", currentUrl);
    console.log("url", url);

    //console.info("\n\n\nurl", url);
    //const x = url.searchParams.get

    function isNextRequest(req: any): req is NextRequest {
      // Minimal check:
      return req?.cookies !== undefined && req?.headers !== undefined && typeof req?.nextUrl !== "undefined";

      // More explicit check might include verifying that:
      // - req is an instance of Request, or
      // - req.nextUrl is an instance of NextURL, etc.
    }

    // Add the requested URL to headers so we can use it later, not sure how else to get the requested url in server components
    const headers = new Headers(req.headers);
    headers.set("x-current-path", targetPath);

    //If the user is on the signin page, pass the country to the headers
    if (targetPath.startsWith("/signin") || targetPath.startsWith("/try") || targetPath.startsWith("/setup/set-office-info")) {
      //get user country from headers
      let country = getReqCountry(req as any);
      if (!country) {
        if (isDevEnv()) {
          country = "CA";
        } else {
          console.error("No country found", req.headers, req.cookies, req.headers.get("x-forwarded-for"));
          //defaulting to CA
          country = "CA";
        }
      }
      if (country) {
        //Check for a "cc" search param
        const cc = url.searchParams.get("cc");
        if (cc) {
          //is it the same as the user country?
          if (cc !== country) {
            url.searchParams.set("cc", country);
            isRedirect = true;
          }
        } else {
          //no cc param, so we need to redirect to the signin page with the country param
          url.searchParams.set("cc", country);
          isRedirect = true;
        }
      }
      headers.set("x-req-country", country);
    }

    if (targetPath === "/") {
      //redirect to /entries
      isRedirect = true;
      url.pathname = "/entries";
      url.href = url.toString();
    }

    /*
      try {
        // Manage rate limiting for API routes
        if (pathname.startsWith("/api")) {
          const ip = req.ip ?? "127.0.0.1";
          try {
            //const { success } = await ratelimit.limit(ip)
            //if (!success) return NextResponse.json({ error: 'Too Many Requests' })
            //return NextResponse.next()
          } catch (error) {
            return NextResponse.json({
              error: "Internal Server Error - Rating limiting",
            });
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          return NextResponse.json({ error: err.message });
        }
      }
      */

    // Manage route protection and authentication
    //const token = await getToken({ req });
    //let session = await getSession(authOptions);      //gives error
    //console.log("getSession", JSON.stringify(session));
    // let session = await getServerSession();     //also gives error
    //console.log("getServerSession", JSON.stringify(session));

    //console.log("Is user authed?", isAuthed);
    //console.log("JSON Web Token", token);

    const signInPages = ["/signin", "/try"];
    const isSignInPages = signInPages.some((route) => targetPath.startsWith(route)); // Check if it's an auth page

    //Nice to have, string types, can i set types for the elems in a string array such that slashes must be there?
    const unAuthedPages = ["/signout", "/auth", "/123"]; //routes that can be visited by an unauthed user
    const isAllowUnAuthedRoute = isSignInPages || unAuthedPages.some((route) => targetPath.startsWith(route)); // Check if it's the login page

    // Define sensitive routes that require authentication
    const sensitiveRoutesStartsWith = ["/"]; //all routes are sensitive by default
    const sensitiveRoutesAre: string[] = []; //example of specifying a particular route as sensitive
    const isSensitiveRoute =
      !isAllowUnAuthedRoute &&
      (sensitiveRoutesStartsWith.some((route) => targetPath.startsWith(route)) || sensitiveRoutesAre.some((route) => targetPath === route));

    if (isSignInPages) {
      // Redirect authenticated users from signin page to entries
      if (userHasSession) {
        return NextResponse.redirect(new URL("/entries", req.url));
      }
    }

    if (!userHasSession && isSensitiveRoute) {
      // Redirect unauthenticated users from sensitive routes to login page
      const signInUrl = new URL("/signin", req.url); // Use req.url as base to preserve host, etc.

      // Append the original path as 'callback' query param if it's not the root path
      if (targetPath && targetPath !== "/") {
        signInUrl.searchParams.append("callbackUrl", targetPath);
      }

      return NextResponse.redirect(signInUrl);
    }
    if (isRedirect) console.info("***isRedirect***", isRedirect);
    // the user is cleared to access the route
    return isRedirect ? NextResponse.redirect(url) : NextResponse.next({ headers });
  })(req as any, ctx);
  return response;
}

//run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|__nextjs|favicon.ico|imgs).*)",
  ],
};
