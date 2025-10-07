import { useCurrentUser } from "@/app-core/src/lib/providers/currentUserProvider";
import { emailIsSuperAppAdmin } from "../../../../common/src/utils/email";

export type CRUDAction = "create" | "read" | "update" | "delete" | "archive" | "*";
export type CRUDActions = CRUDAction | CRUDAction[] | { permissions: CRUDAction[]; conditions?: roleConditions };

//object types defined in this way ensure type safety for including all string keys from CRUDActions
export const CRUDActionObj: Record<CRUDAction, CRUDAction> = {
  create: "create",
  read: "read",
  update: "update",
  delete: "delete",
  archive: "archive",
  "*": "*", //Leave wildcard as last key
};

export type resourceOption =
  | "users"
  | "teams"
  | "office"
  | "clients"
  | "docs"
  | "docs_invite"
  | "docsInviteNotify"
  | "docsApprove"
  | "docsApproveIfTemplateAllows"
  | "docsUnApprove"
  | "docsSecureSend"
  | "templates"
  | "billing"
  | "registerUser"
  | "AIMessage"
  | "authorizeAnother"
  | "inheritRole"
  | "selfAccount"
  | "authentications"
  | "inviteOfficeUser"
  | "inviteUser"
  | "inviteToSoftware"
  | "usageEvent"
  | "logErrors"
  | "stats"
  | "appAdmin_globalTemplates";
export type resourceOptions = resourceOption | resourceOption[];

/* Virtual roles
  OfficeOwner //Person who created or owns the office
  Base //Basic base user abilities all users have regardless of higher roles
  UnAuthed //User is not verified
  */

export type authorizationRole = "Admin" | "Specialist" | "Staff" | "OfficeOwner" | "Client" | "Recipient" | "Base" | "UnAuthed" | "SuperAppAdmin";
export type authorizationRoles = authorizationRole | authorizationRole[];

export const authorizationRoleNameObject: Record<authorizationRole, authorizationRole> = {
  Admin: "Admin",
  Specialist: "Specialist",
  Staff: "Staff",
  OfficeOwner: "OfficeOwner",
  Client: "Client",
  Recipient: "Recipient",
  Base: "Base",
  UnAuthed: "UnAuthed",
  SuperAppAdmin: "SuperAppAdmin",
};
export const authorizationRoleNameArray: Array<authorizationRole> = Object.keys(authorizationRoleNameObject) as Array<authorizationRole>;

export type resourceActions = {
  [key in resourceOption]?: CRUDActions;
};
export type resourceOrResourceAction = resourceActions | resourceOption;

type resourcePermissions = Partial<{
  [resource in resourceOption]: CRUDActions;
}>;

export type roleConditions = {
  hasSubscription?: boolean;
  hasOfficeSubscription?: boolean;
  allowedBetweenHours?: [number, number];
};

export type RolesConfig = {
  [key in authorizationRole]: {
    /**
     * A list of other roles whose permissions should be combined
     * (i.e., additively) with the current role. The resulting permissions
     * will include those from this role plus all roles in 'allOf'.
     */
    allOf?: authorizationRoles;

    /**
     * A list of other roles where having the permissions of *any*
     * of these roles (in addition to the current role) might grant
     * certain actions. This is less common than allOf, but can be used
     * if you need flexible, logical "OR" semantics in combining permissions.
     * Use true to indicate that any role is allowed.
     */
    anyOf?: authorizationRoles | boolean;

    /**
     * A list of roles from which this role inherits.
     * This is a more hierarchical approach than allOf or anyOf,
     * usually meaning "start with these roles' permissions and add or modify."
     */
    inheritFrom?: authorizationRole[];

    /**
     * The base permissions for this role. These define which actions
     * (like create, read, update, delete) a role can perform on which
     * resources.
     */
    permissions?: resourcePermissions;

    /**
     * Permissions to explicitly exclude.
     * For instance, if the role inherits from 'admin' but you want to remove
     * 'delete' permissions for a particular resource, you can list them here.
     */
    excludedPermissions?: resourcePermissions;

    /**
     * Arbitrary conditions that might be used at runtime to further
     * refine whether an action is allowed. For example,
     * {
     *   requiresOwnResource: true,
     *   allowedBetweenHours: [9, 17]
     * }
     * Your authorization logic would read these and apply additional checks.
     */
    conditions?: roleConditions;

    /**
     * A callback function for more complex logic that can’t be easily expressed
     * through static configuration. For example, checking if a user is the owner
     * of the resource, or if the request is happening within certain conditions.
     */
    dynamicChecks?: (user: { role: authorizationRole; [key: string]: any }, resource: any, action: string) => boolean;

    /**
     * Permissions that vary by context. For example, if your system has multiple
     * contexts (e.g., "office", "warehouse", "onlinePortal"), you could specify
     * different permissions in each context. Your authorization logic would
     * then pick the appropriate context permissions at runtime.
     */
    contextualPermissions?: Record<string, resourcePermissions>;
  };
};

export type RoleInherited = {
  expires: string; // Date needs to be converted to string
  role: authorizationRole; // needs to be primitive string, not String object
  n: number;
  grantedBy: string;
  team: string;
  limitToResources?: resourceOrResourceAction;
};

export const rolesConfig: RolesConfig = {
  SuperAppAdmin: {
    permissions: {
      appAdmin_globalTemplates: "*",
    },
  },
  OfficeOwner: {
    permissions: {
      users: "*",
      //billing: "*",
      office: "*",
      inviteOfficeUser: "*",
    },
    conditions: {
      hasOfficeSubscription: true,
    },
  },  
  Specialist: {
    allOf: ["Staff"],
    permissions: {
      teams: "*",
      authorizeAnother: "*",
      clients: "*",
      templates: "*",
      users: ["read"],
      docs: ["create", "read", "update", "archive"],
      docsApprove: "*",
    },
    conditions: {
      hasOfficeSubscription: true,
    },
  },
  Admin: {
    allOf: ["Staff"],
    permissions: {
      authorizeAnother: "*",
      users: "*",
      teams: "*",
      billing: "*",
      clients: ["read", "create", "update"],
      templates: ["read", "create", "update", "archive"],
      office: ["create", "read", "update", "archive"],
      inviteOfficeUser: ["create"],
    },
  },
  Staff: {
    allOf: ["Base"],
    permissions: {
      clients: ["read", "create", "update"],
      templates: ["read"],
      docs: {
        permissions: ["create", "read", "update"],
        conditions: {
          hasOfficeSubscription: true,
        },
      },
      users: ["read"],
      teams: ["read"],
      inviteUser: ["create"],
      AIMessage: ["create"],
      docsInviteNotify: ["create"],
      office: ["create", "read"],
      inheritRole: ["create"],
      docsUnApprove: ["create"],
      docsSecureSend: "*",
    },
  },
  Client: {
    allOf: ["Base"],
    permissions: {
      //AIMessage: ["create"],
    },
  },
  Recipient: {
    allOf: ["Base"],
    permissions: {},
  },
  Base: {
    //Any signed in user
    allOf: ["UnAuthed"],
    permissions: {
      docs: ["read"], //Someone of unknown role might receive a document, so they should be able to read it
      stats: ["create"],
      authentications: ["create", "read", "update"],
      usageEvent: ["create"],
      selfAccount: "*",
      inviteToSoftware: ["create"],
    },
  },
  UnAuthed: {
    //An UnAuthed user, someone who is not logged in
    permissions: {
      authentications: ["create"],
      selfAccount: ["create", "read"],
      logErrors: ["create"],
    },
  },
};

//recursive function that collects all roles, taking care to avoid infinite loops due to circular inheritance.
function addRolesToSet(role: authorizationRole, rolesSoFar: Set<authorizationRole> = new Set()): Set<authorizationRole> {
  if (rolesSoFar.has(role)) {
    // Role already processed, avoid infinite loops
    return rolesSoFar;
  }

  rolesSoFar.add(role);

  const roleConfig = rolesConfig[role];

  if (roleConfig && roleConfig.allOf) {
    for (const inheritedRole of roleConfig.allOf) {
      addRolesToSet(inheritedRole as authorizationRole, rolesSoFar);
    }
  }

  return rolesSoFar;
}

//a type for a partial user that may have all properties of SafeUserWithOffice, or may just have a role of type authorizationRoles
type PartialSafeUserWithOffice = Partial<Record<string,any>> & {
  role?: authorizationRole;
  roleInherited?: RoleInherited | any;
  grantedBy?: string;
};

export type roleHasPermissionReturn = false | { hasPermission: true; usedInheritedRole: boolean };

export function meetsConditions(roleConditions?: roleConditions, userObj?: PartialSafeUserWithOffice | null): boolean {
  if (!roleConditions) {
    return true;
  }
  if (userObj?.id === "68c1f78496561acf24966948") {
    debugger;
  }
  const hasSubscription = userHasSubscription(userObj);
  const hasOfficeSubscription = userHasOfficeSubscription(userObj);
  if (roleConditions?.hasSubscription) {
    if (!hasSubscription) {
      return false;
    }
  }
  if (roleConditions?.hasOfficeSubscription) {
    if (!hasOfficeSubscription) {
      return false;
    }
  }
  if (roleConditions?.allowedBetweenHours) {
    const [start, end] = roleConditions.allowedBetweenHours;
    const currentHour = new Date().getHours();
    if (currentHour < start || currentHour >= end) {
      return false;
    }
  }
  return true;
}

export const hasRole = (userObj?: PartialSafeUserWithOffice, role?: authorizationRole): boolean => {
  if (!userObj || !role) return false;
  const userRolesSet = new Set<authorizationRole>();
  populateUserRolesSet(userObj, userRolesSet);
  return userRolesSet.has(role);
};

export function populateUserRolesSet(userObj: PartialSafeUserWithOffice, userRolesSet: Set<authorizationRole>): void {
  //get users roles
  let userRoles: authorizationRoles = userObj.role ? [userObj.role] : [];

  // add office owner role if user is the owner of the office
  //if (userIsOfficeOwner(userObj)) userRoles.push("OfficeOwner");

  if (emailIsSuperAppAdmin(userObj.email)) userRoles.push("SuperAppAdmin");

  // Collect all assigned user roles

  for (const role of userRoles) {
    addRolesToSet(role as authorizationRole, userRolesSet);
  }
}

export function roleHasPermission(
  userObj?: PartialSafeUserWithOffice | null,
  resourceActions?: resourceActions | resourceOption
): roleHasPermissionReturn {
  if (Object.keys(resourceActions || {})[0] === "docs") {
    debugger;
  }

  if (!resourceActions || (typeof resourceActions === "object" && Object.keys(resourceActions).length === 0)) {
    //Do nothing to nothing
    return { hasPermission: true, usedInheritedRole: false };
  }

  if (!userObj) {
    if (!resourceActions || (typeof resourceActions === "object" && Object.keys(resourceActions).length === 0)) {
      //Do nothing to nothing
      return { hasPermission: true, usedInheritedRole: false };
    }
    //No user, set to UnAuthed user
    userObj = { role: "UnAuthed" } as PartialSafeUserWithOffice;
  }
  //transform string to object
  if (typeof resourceActions === "string") {
    resourceActions = { [resourceActions]: "*" } as resourceActions;
  }

  const userRolesSet = new Set<authorizationRole>();
  populateUserRolesSet(userObj, userRolesSet);

  // add roleInherited role if user has a valid roleInherited
  let roleInherited: authorizationRole | undefined;
  if (userObj?.roleInherited) {
    const roleInheritedObj = userObj.roleInherited as RoleInherited;
    //check if roleInherited is valid
    const roleIsExpired = !roleInheritedObj?.expires || new Date(roleInheritedObj.expires) < new Date();
    const roleIsNotValid = !roleInheritedObj?.role || roleInheritedObj?.n <= 0;
    if (!roleIsExpired && !roleIsNotValid) {
      roleInherited = roleInheritedObj.role;
    }
  }

  // Collect all inherited roles
  const inheritedRolesSet = new Set<authorizationRole>();
  if (roleInherited) {
    for (const role of [roleInherited]) {
      addRolesToSet(role as authorizationRole, inheritedRolesSet);
    }
  }

  //get users permissions
  if ((!userRolesSet || userRolesSet.size === 0) && (!inheritedRolesSet || inheritedRolesSet.size === 0)) return false;

  // Helper function to check if any role in a set has the required permissions
  function checkRolesForPermission(
    roles: Set<authorizationRole>,
    resource: resourceOption,
    actions: CRUDAction[],
    checkConditions: boolean = true
  ): boolean {
    // Check each of the users roles, and see if any of them have the required permissions
    for (const role of roles) {
      const roleConfig = rolesConfig[role];
      const rolePermissions = roleConfig.permissions;
      const roleConditions = roleConfig.conditions;
      //There are additional conditions on a per resourcePermissions basis TODO

      if (checkConditions) {
        if (!meetsConditions(roleConditions, userObj)) {
          continue;
        }
      }

      if (rolePermissions && rolePermissions.hasOwnProperty(resource)) {
        const resourcePerms = rolePermissions[resource];

        let permissionsToCheck: CRUDAction[] = [];
        let conditionsForPerms: roleConditions | undefined;

        if (typeof resourcePerms === "object" && !Array.isArray(resourcePerms) && "permissions" in resourcePerms) {
          permissionsToCheck = resourcePerms.permissions;
          conditionsForPerms = resourcePerms.conditions;
        } else if (Array.isArray(resourcePerms)) {
          permissionsToCheck = resourcePerms as CRUDAction[];
        } else if (typeof resourcePerms === "string") {
          permissionsToCheck = [resourcePerms as CRUDAction];
        } else {
          continue;
        }

        if (checkConditions) {
          if (!meetsConditions(conditionsForPerms, userObj)) {
            continue;
          }
        }

        //Check if the user has all the actions
        let hasAllActions = true;
        for (const action of actions) {
          if (!permissionsToCheck.includes(action) && !permissionsToCheck.includes("*")) {
            hasAllActions = false;
            break;
          }
        }
        if (hasAllActions) return true;
      }
    }
    return false;
  }

  //check all the userRolesSet first, if not found try checking the inheritedRolesSet, if we find a role from the inheritedRolesSet AND on the server side we will decrement the n value of the roleInherited by 1

  //flag to indicate if we used an inherited role, decrement the n value of the roleInherited by 1 if we did
  let usedInheritedRole = false;

  //loop over each each resourceActions and see if the user has a role that can do the action
  for (let [resource, crudActions] of Object.entries(resourceActions) as [resourceOption, CRUDActions][]) {
    let requiredPermissions: CRUDAction[];
    let requiredConditions: roleConditions | undefined;

    if (typeof crudActions === "object" && !Array.isArray(crudActions) && "permissions" in crudActions) {
      requiredPermissions = crudActions.permissions;
      requiredConditions = crudActions.conditions;
    } else if (Array.isArray(crudActions)) {
      requiredPermissions = crudActions as CRUDAction[];
    } else {
      requiredPermissions = [crudActions as CRUDAction];
    }

    //  does the user have a role that can do the action
    let canDoAction = checkRolesForPermission(userRolesSet, resource, requiredPermissions);

    // If base roles don't have permission, check inherited roles if there are any
    if (!canDoAction && inheritedRolesSet.size > 0) {
      canDoAction = checkRolesForPermission(inheritedRolesSet, resource, requiredPermissions, false);
      if (canDoAction) {
        usedInheritedRole = true;
      }
    }

    // If no role has permission, return false
    if (!canDoAction) {
      return false;
    }

    // If permission is granted, check additional conditions from the resource action
    if (requiredConditions && !meetsConditions(requiredConditions, userObj)) {
      return false;
    }
  }

  //They have permission
  return { hasPermission: true, usedInheritedRole };
}

export function useRoleHasPermission(resourceActionsOrOption: resourceActions | resourceOption): roleHasPermissionReturn {
  const { userData } = useCurrentUser();

  return roleHasPermission(userData, resourceActionsOrOption);
}

// Do not use this function if checking for authorization, use roleHasPermission instead
export const roleIsAdmin = (role?: string): boolean => {
  if (role && role.includes("Admin")) {
    return true;
  }
  return false;
};

export const userHasSubscription = (user?: PartialSafeUserWithOffice | null): boolean => {
  if (!user) return false;
  //Basic check, if user has a valid subscription, they have a subscription
  //NOTE, this field of user object needs to be validated against stripe from time to time. Maybe via stripe webhook
  if (user?.hasValidSubscription) return true;

  //The user is in a trial office
  if (officeHasTrialOrEnterprise(user?.office)) {
    //If the office has a trial, and the user is a recipient, they have a subscription
    return true;
  }

  return false;
};

export const userHasOfficeSubscription = (user?: PartialSafeUserWithOffice | null): boolean => {
  if (!user) return false;
  if (user?.officeHasValidSubscription) return true;
  return false;
};

export function officeHasTrialOrEnterprise(office?: Record<string, any> | null) {
  if (!office) return false;
  return officeHasExtendedTrial(office) || officeHasExternalPaymentSubscription(office);
}

export function officeHasExtendedTrial(office?: Record<string, any> | null) {
  if (!office) return false;
  if (office.custom?.hasOwnProperty("trial") && (office.custom as Record<string, any>)?.trial === "Extended") {
    return true;
  }
  return false;
}

export function officeHasExternalPaymentSubscription(office?: Record<string, any> | null) {
  if (!office) return false;
  if (office.custom?.hasOwnProperty("externalPaymentSubscription") && (office.custom as Record<string, any>)?.externalPaymentSubscription) {
    return true;
  }
  if (office.custom?.hasOwnProperty("enterprise") && (office.custom as Record<string, any>)?.enterprise) {
    return true;
  }
  return false;
}
