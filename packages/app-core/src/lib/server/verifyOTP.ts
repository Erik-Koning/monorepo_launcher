"use server";

import speakeasy from "@levminer/speakeasy";

type returnString = "ok" | "fail" | "db failed";

export async function verifyOTP(email: string, token: string): Promise<returnString> {
  // Get the otp secret from the database
  const otp = {secret: "FAKE SECRET"};
  /*await prisma.oTP.findUnique({
    where: {
      email: email,
    },
  });*/
  if (!otp) {
    return "db failed";
  }

  // Verify the token
  const verified = speakeasy.totp.verify({
    secret: otp.secret,
    encoding: "base32",
    token: token,
  });
  if (verified) return "ok";
  return "fail";
}
