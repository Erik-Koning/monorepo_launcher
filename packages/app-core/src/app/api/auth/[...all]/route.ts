/* initialize BetterAuth with a Route Handler

When a route is defined with [...all], it means that any path that matches the 
pattern will be handled by the same route.

routes are defined in the form of a handler function that is exported as GET and POST.
further secured via:
1. const validUserResponse = await validateUser(req as any); //To validate the user from request JWT Token in Request Header or a passed token, returns user object if valid
2.     if (!(roleHasPermissionServerSide(validUser, { selfAccount: "create" }))) {  //To check if user has permission to do action
*/

import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/src/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);
