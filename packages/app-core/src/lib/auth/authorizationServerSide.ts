"use server";

import { resourceActions, resourceOption, roleHasPermission, roleHasPermissionReturn, RoleInherited } from "./authorization";

// Server side we decrement the n value of the roleInherited if used
export async function roleHasPermissionServerSide(
  user?: Record<string,any>,
  resourceActionsOrOption?: resourceActions | resourceOption
): Promise<roleHasPermissionReturn> {
  const { hasPermission, usedInheritedRole } = roleHasPermission(user, resourceActionsOrOption) || { hasPermission: false, usedInheritedRole: false };

  if (!hasPermission) {
    return false;
  }

  // If we used an inherited role, decrement n
  if (user && usedInheritedRole && user?.roleInherited) {
    //decrement n value, if has one
    const newN = (user.roleInherited as RoleInherited).hasOwnProperty("n") ? (user.roleInherited as RoleInherited).n - 1 : 0;

    // Update the roleInherited in the database
    /*await prisma.user.update({
      where: { id: user.id },
      data: {
        //Save the decremented n value or remove the roleInherited if n <= 0
        roleInherited: {
          ...(user.roleInherited as RoleInherited),
          n: newN,
        } as RoleInherited,
      },
    });
    */
  }

  return { hasPermission, usedInheritedRole };
}
