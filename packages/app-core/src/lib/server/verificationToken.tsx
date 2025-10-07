import { saveAndGenerateJWTAccessToken } from "./saveAndGenerateJWTAccessToken";

export function generateVerificationCode(length = 6) {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let token = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters[randomIndex];
  }

  return token;
}

export function getTokenExpiration(seconds = 15 * 60): Date {
  const expirationTime = seconds * 1000; // 15 minutes in milliseconds
  const expirationDate = new Date(Date.now() + expirationTime);
  return expirationDate;
}

//Type for verification code response
export type VerificationCodeResponse = {
  jwt?: string;
  expiry?: Date;
  code?: string;
};

//creates short code tokens for verification
export const createOrUpdateVerificationCode = async (
  identifier: string,
  expirySeconds: number = 15 * 60,
  withJWT: boolean = true,
  jwtPayload?: Record<string, any>
): Promise<VerificationCodeResponse> => {
  let jwt: string | undefined = undefined;
  let expiry: Date | undefined = undefined;

  if (withJWT) {
    const jwtObj = await saveAndGenerateJWTAccessToken(jwtPayload, identifier, expirySeconds, false);
    if (jwtObj) {
      jwt = jwtObj.jwt;
      expiry = jwtObj.expiry;
    } else {
      console.warn("saveAndGenerateJWTAccessToken returned null");
    }
  }

  // Generate a short token
  const code = generateVerificationCode();

  // Generate an expiration date for the short token
  if (!expiry) expiry = getTokenExpiration(expirySeconds);

  // Use upsert to either update an existing token or create a new one
  /*await prisma.verificationToken.upsert({
    where: {
      identifier: identifier,
    },
    update: {
      code: code,
      jwt: jwt,
      expires: expiry,
      RLCount: 0,
    },
    create: {
      identifier: identifier,
      code: code,
      jwt: jwt,
      expires: expiry,
    },
  });*/

  return { jwt, expiry, code };
};
