"use server";

import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { sendRenewEmailTokenUrlEmail } from "../../../../common/src/server/emails/sendRenewEmailTokenUrlEmail";
import { createOrUpdateVerificationCode } from "@/src/lib/server/verificationToken";
import { appendURLParams } from "@/utils/url";
import { resIsSuccess } from "@/utils/httpStatus";

// Define a type for your response data
export type ValidateTokenResponse = {
  message: string;
  token?: JwtPayload;
};

export type VerificationToken = {
  jwt: string;
  expiry: string;
  code: string;
  RLCount: number;
  RLimit: number;
};

export async function validateToken(
  urlToken?: string | boolean,
  skipExpiry?: boolean,
  checkTokenMatch: boolean = false,
  removeAfterFind: boolean = false,
  emailURLWithNewJWT: string = "",
  resendJWTEmail?: boolean //if true, we will send a new JWT email to the user, regardless of why token is invalid
): Promise<NextResponse<ValidateTokenResponse>> {
  const JWTRLimit = 10;
  try {
    if (!urlToken || typeof urlToken !== "string") {
      return NextResponse.json({ message: "user token does not exist" }, { status: 401 });
    }

    const decodedJWT = jwt.decode(
      urlToken
      //String(process.env.JWT_SECRET)
    ) as JwtPayload;

    if (!decodedJWT || !decodedJWT.iss) {
      return NextResponse.json({ message: "invalid JWT token" }, { status: 500 });
    }

    // Check if token exists in db
    // Conditionally build the where clause
    const whereClause: { identifier: string; jwt?: string } = {
      identifier: decodedJWT.iss,
    };

    if (checkTokenMatch && urlToken) {
      whereClause.jwt = urlToken;
    }

    // Check if the token exists in the database
    let tokenExists: VerificationToken | null;
    try {
      tokenExists = {jwt: "FAKE JWT", expiry: new Date().toISOString(), code: "FAKE CODE", RLCount: 0, RLimit: 0};
      /*await prisma.verificationToken.update({
        where: whereClause,
        data: {
          RLCount: {
            increment: 1,
          },
        },
      });*/
    } catch (error) {
      //its okay possibly part of a signin request
      return NextResponse.json({ message: "Failed to find token", error: error }, { status: 401 });
    }

    if (!tokenExists || tokenExists.jwt !== urlToken) {
      if (resendJWTEmail && emailURLWithNewJWT) {
        const { jwt: newJWT, expiry, code } = await createOrUpdateVerificationCode(decodedJWT.iss, 15 * 60);
        const newEmailResponse = await sendRenewEmailTokenUrlEmail(
          decodedJWT.iss,
          undefined,
          expiry,
          undefined,
          "New link",
          appendURLParams(emailURLWithNewJWT, { JWT: newJWT })
        );
        if (resIsSuccess(newEmailResponse)) return NextResponse.json({ message: "expired token", sentNewLink: true }, { status: 401 });
        else return NextResponse.json({ message: "expired token", sentNewLink: false }, { status: 401 });
      }
      console.error("Invalid verification token in db");
      return NextResponse.json({ message: "Invalid verification token" }, { status: 401 });
    }

    let tokenRLExceeded = false;
    if (tokenExists.RLCount > (tokenExists.RLimit !== null ? tokenExists.RLimit : JWTRLimit)) {
      //expire the token, expired it now
      tokenExists = {jwt: "FAKE JWT", expiry: new Date().toISOString(), code: "FAKE CODE", RLCount: 0, RLimit: 0};
      /*await prisma.verificationToken.update({
        where: whereClause,
        data: {
          expires: new Date().toISOString(),
        },
      });*/
      return NextResponse.json({ message: "Token rate exceeded" }, { status: 401 });
    }

    if (!skipExpiry || tokenRLExceeded) {
      // Extract the expiration time from the decoded token
      const expirationTime = decodedJWT.exp;

      ////console.log("expirationTime", expirationTime);

      // Get the current UNIX timestamp
      const currentTimeSeconds = Math.floor(Date.now() / 1000);

      ////console.log("CurrentTime", currentTime);

      // Compare the current time with the expiration time
      if ((expirationTime && expirationTime < currentTimeSeconds) || (tokenExists.expiry && new Date(tokenExists.expiry).getTime() < currentTimeSeconds * 1000)) {
        //The JWT is expired, should we email the user a new JWT?
        if (emailURLWithNewJWT) {
          const { jwt: newJWT, expiry, code } = await createOrUpdateVerificationCode(decodedJWT.iss, 15 * 60);
          const newEmailResponse = await sendRenewEmailTokenUrlEmail(
            decodedJWT.iss,
            undefined,
            expiry,
            undefined,
            "New access link",
            appendURLParams(emailURLWithNewJWT, { JWT: newJWT })
          );
          if (resIsSuccess(newEmailResponse)) return NextResponse.json({ message: "expired token", sentNewLink: true }, { status: 401 });
          else return NextResponse.json({ message: "expired token", sentNewLink: false }, { status: 401 });
        }
        return NextResponse.json({ message: "expired token" }, { status: 401 });
      }
    }

    if (removeAfterFind) {
      // Remove the token from the database
      tokenExists = {jwt: "FAKE JWT", expiry: new Date().toISOString(), code: "FAKE CODE", RLCount: 0, RLimit: 0};
      /*await prisma.verificationToken.delete({
        where: whereClause,
      });*/
    }

    // If you need to send user data in the response, you can format it as needed
    // Be careful to not send sensitive data
    return NextResponse.json({ message: "ok", decodedJWT: decodedJWT, VTDetails: tokenExists }, { status: 200 });
  } catch (error) {
    console.error("Error validating token server error:", error);
    return NextResponse.json({ message: "Failed to validate user server side when validating token" }, { status: 500 });
  }
}
