export const userCanEditModel = (user: Record<string,any>): boolean => {
  const email = user.email.toLowerCase();
  return (process.env.NEXT_PUBLIC_APP_DOMAIN_NAME && email.endsWith(process.env.NEXT_PUBLIC_APP_DOMAIN_NAME)) || email.endsWith("@koning.ca");
};
