"use server";

import { getIpAddress, getReqCountry, getReqLatLong, reqTypes, userIPs } from "@common/server/apiRequests";
import { isBackdoorLogin, isPermissibleBackdoorEmail } from "@/packages/common/src/server/backdoorLogin";
import { verifyOTP } from "@/src/lib/server/verifyOTP";
import bcrypt from "bcryptjs";

type User = { name: string; email: string; office: { name: string } };

export async function authenticateUser(
  req: reqTypes,
  user?: User | null | string,
  credentials?: Record<string, any>,
  skipIPs: boolean = !!process.env.NEXT_PUBLIC_DISABLE_IP_CHECKS || false,
  skip2FA: boolean = false,
  allowPin: boolean = false,
  backdoorUser?: string,
  isLogin: boolean = false,
  debug: boolean = false
): Promise<User | null> {
  const loginTime = new Date();
  const IP = getIpAddress(req, debug); //works for nextRequest, APIGatewayevent, and BetterAuth request obj
  const IPCounty = getReqCountry(req, debug);
  const IPLatLong = getReqLatLong(req);
  let userToReturn: User | string | null | undefined = undefined;
  if (backdoorUser) {
    //We will authenticate the backdoor user and return the user object later
    userToReturn = user;
    //Force 2fa to be false
    skip2FA = false;
    //Force skipIPs to be false only if not on localhost with backdoor user
    if (!((IP === "127.0.0.1" || IP === "::1" || IP === " ::1" || IP === "localhost") && isPermissibleBackdoorEmail(backdoorUser ?? user))) {
      console.log("***************** setting skipIPs to false");
      skipIPs = false;
    }
    debug && console.log("***************** backdoorUser", backdoorUser);
  }

  debug && console.log("***************** user", user);
  //console.log("***************** credentials", credentials);
  // if user is a string, it is an email
  if (typeof user === "string") {
    user = { name: "John Doe", email: user, office: { name: "Office 1" } };
  }

  debug && console.log("***************** user after fetch", user);

  // if user is null, it is an error
  if (!user) {
    //TODO add rate limits for the ip
    return null;
  }

  let userData = { name: "John Doe", email: user.email, office: { name: "Office 1" } };

  /*
   * Check if IP and IPCountry is allowed
   */
  debug && console.log("***************** skipIPs\n\n\n\n\n\n\n", skipIPs);
  if (!skipIPs) {
    const userVerifiedIPsArr = (user as any)?.IPs as userIPs[];

    console.log("IP details", IP, IPCounty, IPLatLong);
    console.log("userVerifiedIPsArr", userVerifiedIPsArr);

    let foundIPMatch = false;
    for (let i = 0; i < userVerifiedIPsArr.length; i++) {
      //Check if there is an element with IP and Country Match
      if (userVerifiedIPsArr[i].verified && userVerifiedIPsArr[i].ip === IP && userVerifiedIPsArr[i].country === IPCounty) {
        foundIPMatch = true;
        //add the latLong and current time to the userIPs
        userVerifiedIPsArr[i].latLong = IPLatLong;
        userVerifiedIPsArr[i].lastLogin = loginTime;
        (userData as any).IPs = userVerifiedIPsArr as any[];
        break;
      }
    }
    if (!foundIPMatch) {
      //This IP is new and not allowed
      debug && console.log("***************** IP not allowed", IP, IPCounty);
      return null;
    }

    // save this login time
    (userData as any).lastLogin = loginTime;
  }

  debug && console.log("***************** userData", userData);

  if (!credentials?.password) {
    //Fallback if allowed to use pin
    if (allowPin && credentials?.pin && (user as any).pinId) {
      const userPin = (user as any).pinId;
      if (!userPin) {
        return null;
      }
      const verified = await bcrypt.compare(String(credentials?.pin), userPin.pin);

      if (!verified) {
        return null;
      }
    } else {
      //No password and no pin
      return null;
    }
  } else {
    // Default case, the user passed a password
    if (!(user as any)?.hpId) {
      //TODO add rate limit check on user
      return null;
    }

    //Fetch the userHP from the database
    const userHP = (user as any).hpId;

    debug && console.log("***************** userHP", userHP);

    if (!userHP || !userHP.hashedPassword) {
      return null;
    }

    // Compare password
    if (!(await bcrypt.compare(credentials?.password, userHP.hashedPassword))) {
      debug && console.log("***************** incorrect password", userHP.hashedPassword);
      return null;
    }
  }

  console.log("***** has credentials", !!credentials, "has 2fa", !!credentials?.twoFAToken, "backdoorUser", backdoorUser);

  // Does user have 2FA enabled?
  if (!skip2FA && ((user as any).twoFAEnabled || backdoorUser)) {
    debug && console.log("***************** skip2FA", skip2FA, (user as any).twoFAEnabled, backdoorUser);
    if (!credentials?.twoFAToken) return null;
    //check if OTP is valid
    try {
      const verified = await verifyOTP(backdoorUser ?? credentials.email, credentials.twoFAToken);
      debug && console.log("***************** verified", verified);
      if (verified !== "ok") {
        return null;
      }
    } catch (error: any) {
      debug && console.log("***************** error", error);
      return null;
    }
  }

  // If we are authenticating a backdoor user, we need to return the user object later
  if (backdoorUser && userToReturn && typeof userToReturn === "string") {
    //We are authenticating a backdoor user, so we need to return the user object later
    userToReturn = { name: "John Doe", email: userToReturn, office: { name: "Office 1" } };
    if (!userToReturn) {
      debug && console.log("***************** userToReturn not found", userToReturn);
      return null;
    }
  }

  userToReturn = typeof userToReturn === "object" && (userToReturn as any)?.id ? userToReturn : user;
  if (!userToReturn) return null;

  //AUTHENTICATED!

  // Set the subscription valid status "hasValidSubscription" on login
  // Check if the user is covered by a stripe subscription.
  if (isLogin) {
    //userData = await getUserModelSubscriptionStatus(userToReturn as any, userData);
  }

  if (Object.keys(userData).length > 0) {
    // We made it, save this login dateTime
    //Normal user update and return the user object
    const updatedUser = { name: "John Doe", email: userToReturn.email, office: { name: "Office 1" } };
    /*await prisma.user.update({
      where: {
        id: userToReturn.id,
      },
      data: userData,
    });
    */
    debug && console.log("***************** updatedUser", updatedUser);
    return updatedUser;
  } else {
    // No update needed,return the user object
    return userToReturn;
  }
}
