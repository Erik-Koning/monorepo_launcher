/* initialize NextAuth.js with a Route Handle

When a route is defined with [...nextauth], it means that any path that matches the 
pattern will be handled by the same route.

routes are defined in the form of a handler function that is exported as GET and POST.
further secured via:
1. const validUserResponse = await validateUser(req as any); //To validate the user from request JWT Token in Request Header or a passed token, returns user object if valid
2.     if (!(roleHasPermissionServerSide(validUser, { selfAccount: "create" }))) {  //To check if user has permission to do action
*/

import { handlers } from "@/src/auth"; // Referring to the auth.ts we just created
export const { GET, POST } = handlers;
