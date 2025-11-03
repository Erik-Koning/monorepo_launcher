import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { Session } from "better-auth";
import { getReqCountry } from "@/packages/common/src/server/apiRequests";
import { isDevEnv } from "@/packages/common/src/utils/environments";

export function sessionIsValid(session: any) {
  return !!session && session.expiresAt && new Date(session.expiresAt) > new Date();
}

// The middleware function is defined to handle incoming requests (NextRequest).
// It retrieves the pathname of the request to understand which route is being accessed.
// It checks for user authentication by trying to get a token. If a token is found (!!token), it implies that the user is authenticated.
// The middleware determines whether the current path is an authentication page (/signin, /try) or a sensitive route that requires authentication (like /entries and /).
export default function proxy(req: NextRequest) {
  // Get session using BetterAuth
  const session = getSessionCookie(req);

  // Check if user is authenticated
  const userHasSession = sessionIsValid(session);

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
