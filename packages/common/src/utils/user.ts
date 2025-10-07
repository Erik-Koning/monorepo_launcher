export function nameWithPrefix(user: Record<string,any>) {
  return `${user.prefix ? `${user.prefix} ` : ""}${user.firstName} ${user.lastName}`;
}
