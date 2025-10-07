"use server";

import { generateJWTAccessToken } from "../../../../common/src/utils/jsonWebToken";
import { date } from "zod";
import { generateVerificationCode } from "./verificationToken";

export async function saveAndGenerateJWTAccessToken(
  payload?: Record<string, any>,
  issuer?: string, //typically an email, will be saved as the issuer
  expirySeconds: number = 60 * 60 * 24,
  save: boolean = true,
  saveShortToken: boolean = false,
  resetRLCount: boolean = false
): Promise<{ jwt: string; expiry: Date; code: string | undefined } | null> {
  try {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const exp = now + expirySeconds; // Expiry time in seconds

    const jwt = generateJWTAccessToken(payload, { expiresIn: exp, issuer: issuer });
    const expiry = new Date(exp * 1000); // Convert seconds to milliseconds for Date
    console;

    const code = saveShortToken ? generateVerificationCode() : undefined;

    let token = undefined;
    if (save && !issuer) {
      console.warn("trying to save JWT but aborting - no issuer");
    }
    if (save && issuer) {
      // Save the token in the database
      token = {jwt: "FAKE JWT", expiry: expiry.toISOString(), code: code, RLCount: resetRLCount ? 0 : undefined};
      /*await prisma.verificationToken.upsert({
        where: {
          identifier: issuer,
        },
        update: {
          jwt: jwt,
          expires: expiry.toISOString(),
          code: code,
          RLCount: resetRLCount ? 0 : undefined,
        },
        create: {
          identifier: issuer,
          jwt: jwt,
          expires: expiry.toISOString(),
          code: code,
        },
      });*/
      if (!token) {
        return null;
      }
    }

    // Return both emailAccessToken and expiry on success
    return { jwt, expiry, code };
  } catch (error) {
    // Handle the error (e.g., log it)
    console.error("Error saving verification token:", error);

    // Return null or undefined in case of an error
    return null;
  }
}
