import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  plugins: [nextCookies()],
  emailAndPassword: {
    enabled: true,
  },

  // Google OAuth can be added here if needed
  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  //   },
  // },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookiePrefix: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      strategy: "jwe",
      refreshCache: true,
    },
  },
  pages: {
    signIn: "/signin",
  },
});
