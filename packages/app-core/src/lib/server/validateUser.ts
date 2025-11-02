import { resIsSuccess } from "@/utils/httpStatus";
import { JwtPayload } from "jsonwebtoken";
import { auth } from "@/src/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "./validateToken";
import { cloneDeep } from "lodash";
import { loggingAPIcall } from "../../../../common/src/utils/logging";
import {
  denyCountries,
  getIpAddress,
  getReqCountry,
  isGetRequest,
  isNextRequest,
  serveCountries,
  userIPs,
} from "../../../../common/src/server/apiRequests";
import { isDevEnv, isProdEnv } from "../../../../common/src/utils/environments";
import { backdoorGetUserByEmail } from "../../../../common/src/server/backdoorLogin";
import { retryPromise } from "../../../../common/src/utils/errors";

export function checkUserHasVerifiedIP(user: Record<string, any>, ip: string) {
  if (!user.IPs) return false;
  //Get the user's IP addresses
  const userIPs = user.IPs as unknown as userIPs[];
  //Check if the user has a verified IP address
  const hasVerifiedIP = userIPs.find((ipObj: userIPs) => ipObj.ip === ip && ipObj.verified);
  if (hasVerifiedIP) {
    return true;
  }
  return false;
}

// Define a type for your response data
export type ValidateUserResponse = {
  message: string;
  user?: Record<string, any>;
  body?: Record<string, any>;
  decodedJWT?: JwtPayload | null;
  VTDetails?: Record<string, any> | null;
};

type JWT = {
  email?: string;
  id?: string;
  name?: string;
};

export async function validateUser(
  req: NextRequest | Record<string, any>,
  urlToken?: string | true | { key: string }, //if an object it is the name of the JWT token inside the req body.
  allowUnAuthed: boolean = false,
  skipRLCheck: boolean = false,
  skipExpiry?: boolean,
  requireVerified: boolean = true,
  checkTokenMatch: boolean = false,
  removeAfterFind: boolean = false,
  emailURLWithNewJWT: string = "",
  requireAuthToken: boolean = false,
  getUserByEmail?: string | true, //if true we get the user from the cloned request
  checkUserIPAllowed: boolean = true,
  redactBodyKeyFromLogs?: string[],
  resendJWTEmail?: boolean //if true, we will send a new JWT email to the user, regardless of why token is invalid
): Promise<NextResponse<ValidateUserResponse>> {
  const debugSteps = [];

  try {
    let authToken: JWT | null = null;
    const RLCountMax = 100; //X requests
    const RLCountBlock = RLCountMax * 1.5; //X requests
    const RLWindow = 60000; //X milliseconds
    const ip = getIpAddress(req); //can also validate the user is doing this request from an allowed IP address form their account settings
    const ipCountry = getReqCountry(req); //true for debug
    const reqIsNextRequest: boolean = isNextRequest(req);
    //console.log("validateUser", req);

    // clone the request so we can modify it without affecting its ability to have its body read later
    // waring - can only clone if the request has not been read yet,
    // clones dont appear to pass the isNextRequest, clones are modified

    //clone the request so not to affect the original request readable body
    let reqClone: NextRequest | Record<string, any> = reqIsNextRequest ? (req as NextRequest).clone() : (cloneDeep(req) as any);
    let reqBody: Record<string, any> | undefined = {};
    //console.log("req 123", req);
    let reqUrl: string = isNextRequest(req) ? req.url : "unknown";
    let referrer: string = isNextRequest(req) ? req.headers.get("referer") ?? "" : "";
    const currentDate = new Date();

    let otherRequestDetails: Record<string, any> = {
      ip,
      ipCountry,
      reqUrl,
      referrer,
      reqIsNextRequest,
    };

    if (!isGetRequest(req)) {
      // We read the body for logging, and for getting the user email if it is asked for, and for passing back. TODO we could have all apis that use validateUser reuse this processed body
      try {
        reqBody = isNextRequest(req) ? ((await (reqClone as NextRequest).json()) as Record<string, any>) : undefined;
      } catch (error) {
        //keep the reqBody unaltered
      }
    }

    if (urlToken && typeof urlToken === "object") {
      //get the urlToken if it is specified in the request body
      urlToken = reqBody?.[urlToken.key] as string | undefined;
    }
    if (urlToken === true) {
      //get the token from the request body
      urlToken = reqBody?.token as string | undefined;
    }

    let decodedJWT: JwtPayload | null = null;
    let VTDetails: Record<string, any> | null = null;

    if (isNextRequest(req)) {
      // is a NextRequest
      // get the session using BetterAuth
      const session = await auth.api.getSession({
        headers: (req as NextRequest).headers,
      });
      if (session?.user) {
        authToken = {
          email: session.user.email,
          id: session.user.id,
          name: session.user.name,
        } as any;
      }
    } else {
      //Could be an APIGatewayProxyEventV2, or other request type
      //console.log("in isAPIGatewayProxyEventV2", req);
      if (req.headers.authorization && !urlToken) {
        //get the bearer token
        urlToken = req.headers.authorization.split(" ")[1];
      }
      if (!urlToken) {
        console.error("No token found in headers");
        return NextResponse.json({ message: "user token does not exist" }, { status: 401 });
      }
    }

    //if it is not a NextRequest, set the req so it has a similar format

    // Cast the request to unknown first, then to APIGatewayProxyEventV2
    //let apiGatewayEvent = req as unknown as APIGatewayProxyEventV2;

    // Now you can handle APIGatewayProxyEventV2-specific logic
    //const cookies = extractCookies(apiGatewayEvent);

    // Create a custom req object
    //req = createCustomReq(req, cookies);

    // No authToken, and not allowing unathed, check for a urlToken JWT to authenticate with
    if (requireAuthToken || (!allowUnAuthed && (!authToken || !authToken?.email))) {
      //Lets try with the token passed in the request body
      if (!urlToken) {
        console.error("No token in request body or urlToken");
        return NextResponse.json({ message: "user session does not exist" }, { status: 401 });
      }

      // Verify and decode the JWT token which should contain the user email
      const validatedTokenResponse = await validateToken(
        urlToken as string,
        skipExpiry,
        checkTokenMatch,
        removeAfterFind,
        emailURLWithNewJWT,
        resendJWTEmail
      );
      if (!resIsSuccess(validatedTokenResponse)) {
        return validatedTokenResponse;
      }
      let validatedTokenResponseJson: any;
      try {
        validatedTokenResponseJson = (await validatedTokenResponse.json()) as any;
      } catch (error) {
        console.error("Failed to parse validatedTokenResponse", error);
        validatedTokenResponseJson = { Error: "Error parsing validatedTokenResponse", message: (error as Error).message };
      }

      // The response is successful, extract the user object
      decodedJWT = validatedTokenResponseJson?.decodedJWT;
      VTDetails = validatedTokenResponseJson?.VTDetails;
    }

    const validatedUserEmail = authToken?.email ? authToken.email : decodedJWT?.iss ? decodedJWT.iss : undefined;
    console.info("\n***************** validatedUserEmail", validatedUserEmail);
    if (getUserByEmail === true) {
      console.info("\n***************** getUserByEmail is true");
      getUserByEmail = reqBody?.email as string;

      //Method for app admin to access user account sessions
      const backdoorUser = backdoorGetUserByEmail(getUserByEmail);
      console.info("\n***************** backdoorUser", backdoorUser);
      if (backdoorUser?.isBackdoor) {
        console.info("\n***************** backdoorUser is backdoor");
        getUserByEmail = backdoorUser.email;
      }
    }

    //Do we serve the country? Only check for NextRequest as APIGatewayProxyEventV2 does not have a country header
    if (reqIsNextRequest && ((serveCountries && !serveCountries?.includes(ipCountry)) || (denyCountries && denyCountries?.includes(ipCountry)))) {
      if (isProdEnv()) {
        console.info("Denied", ip ?? "unknown ip", "from", ipCountry ?? "unknown country");
        return NextResponse.json({ message: "Sorry we do not currently serve your country" }, { status: 403 });
      }
    }

    //Compliance log, log the user access to resources
    loggingAPIcall(validatedUserEmail ?? getUserByEmail ?? "no email", reqBody, otherRequestDetails, redactBodyKeyFromLogs);

    //Get the user object if we have a validated user email
    let user = validatedUserEmail
      ? {
          name: "John Doe",
          email: validatedUserEmail,
          emailVerified: true,
          RLCount: 0,
          RLExpiry: new Date(currentDate.getTime() + RLWindow),
          role: "Admin",
          office: { name: "Office 1", roleMapping: {} },
        }
      : undefined;
    /*await prisma.user.findUnique({
          where: {
            email: validatedUserEmail,
          },
          include: {
            office: true,
          },
        })
      : undefined;*/

    console.info("\n***************** user2", user);

    if (user) {
      const newUserData = {
        lastAPICall: currentDate,
        RLCount: 0,
        RLExpiry: new Date(currentDate.getTime() + RLWindow),
        role: "Admin",
      };

      //Confirm the user has correct role
      const userOffice = user.office;
      const officeRoleMapping = userOffice ? (userOffice.roleMapping as Record<string, any>) : {};
      if (officeRoleMapping) {
        //Is the user in the role mapping?
        if (!Object.keys(officeRoleMapping).includes(user.email)) {
          console.error("User claims to be in an office but office records have discrepancy", user.email, officeRoleMapping);
          return NextResponse.json({ message: "User claims to be in an office but office records have discrepancy" }, { status: 403 });
        }
        //Is the user's role matching the role mapping?
        else if (officeRoleMapping[user.email] !== "Admin") {
          //Update the user's role to the role mapping
          newUserData.role = officeRoleMapping[user.email];
        }
      }

      //Rate limiting checks and updates if window expired
      if (!skipRLCheck) {
        if (!user.RLCount || !user.RLExpiry) {
          newUserData.RLCount = 0;
          newUserData.RLExpiry = new Date(currentDate.getTime() + RLWindow);
        } else if (user.RLCount > RLCountMax) {
          if (user.RLExpiry && user.RLExpiry > currentDate) {
            return NextResponse.json({ message: "Rate limit exceeded" }, { status: 429 });
          } else {
            //reset the count, expiry, and let the user through
            newUserData.RLCount = 0;
            newUserData.RLExpiry = new Date(currentDate.getTime() + RLWindow);
          }
        }
      }

      if (Object.keys(newUserData).length > 0) {
        user = {
          name: "John Doe",
          email: user.email,
          emailVerified: true,
          RLCount: newUserData.RLCount,
          RLExpiry: newUserData.RLExpiry,
          role: newUserData.role,
          office: { name: "Office 1", roleMapping: {} },
        };
        /*await retryPromise(() =>
          prisma.user.update({
            where: {
              id: user!.id,
            },
            data: newUserData,
            include: {
              office: true,
            },
            //cacheStrategy: {
          })
        );*/
      }
    }

    if (!user) {
      if (allowUnAuthed) {
        if (!skipRLCheck) {
          //check the ip address rate limit
          const ipRL = { count: 0, expiry: new Date(currentDate.getTime() + RLWindow) };
          /*await prisma.rateLimitIP.upsert({
            where: {
              ip: ip,
            },
            update: {
              count: {
                increment: 1,
              },
            },
            create: {
              ip: ip,
              count: 1,
              expiry: new Date(currentDate.getTime() + RLWindow),
            },
          });*/
          //console.log("\n\n*****ipRL****", ipRL);
          if (ipRL.count > RLCountMax) {
            if (ipRL.expiry && ipRL.expiry > currentDate) {
              if (ipRL.count > RLCountBlock) {
                // TODO block the ip address via cloudfront or other means
              }
              return NextResponse.json({ message: "Rate limit exceeded" }, { status: 429 });
            } else {
              //reset the count, expiry, and let the user through
              ipRL.count = 0;
              ipRL.expiry = new Date(currentDate.getTime() + RLWindow);
              /*await prisma.rateLimitIP.update({
                where: {
                  ip: ip,
                },
                data: {
                  count: 0,
                  expiry: new Date(currentDate.getTime() + RLWindow),
                },
              });*/
            }
          }
        }

        if (getUserByEmail) {
          const gotUser = {
            name: "John Doe",
            email: getUserByEmail,
            RLCount: 0,
            RLExpiry: new Date(currentDate.getTime() + RLWindow),
            role: "Admin",
            office: { name: "Office 1", roleMapping: {} },
          };
          /*await prisma.user.findUnique({
            where: {
              email: getUserByEmail,
            },
            include: {
              office: true,
            },
          });*/
          if (gotUser) {
            return NextResponse.json({ message: "User not verified", user: gotUser, body: reqBody }, { status: 200 });
          }
        }

        return NextResponse.json({ message: "User not found", body: reqBody }, { status: 200 });
      }
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    } else if (requireVerified && !user.emailVerified) {
      if (allowUnAuthed) {
        return NextResponse.json({ message: "User not verified", user: user, body: reqBody }, { status: 200 });
      }
      return NextResponse.json({ message: "User not verified" }, { status: 403 });
    }

    //WE dont check the ip address for a user since their ip address may change during usage
    /*if (checkUserIPAllowed && !process.env.NEXT_PUBLIC_DISABLE_IP_CHECKS) {
      //check if the user is allowed to access the resource
      const ipAllowed = checkUserHasVerifiedIP(user, ip);
      if (!ipAllowed) {
        if (isProdEnv() || !user.email.endsWith(process.env.NEXT_PUBLIC_APP_DOMAIN_NAME!)) {
          return NextResponse.json({ message: "Please verify this IP address by re-signing in, or updating your account settings" }, { status: 403 });
        }
      }
    }*/

    //user validated
    return NextResponse.json({ message: "", user: user, decodedJWT: decodedJWT, VTDetails: VTDetails, body: reqBody }, { status: 200 });
  } catch (error) {
    console.error("Failed to validate user server side", error);
    return NextResponse.json({ message: "Failed to validate user server side" }, { status: 500 });
  }
}
