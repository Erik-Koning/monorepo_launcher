import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateUser } from "@/app-core/src/lib/server/validateUser";
import { resIsSuccess } from "@/utils/httpStatus";
import { roleHasPermissionServerSide } from "@/app-core/src/lib/auth/authorizationServerSide";

// Interface type for the request body
export interface HealthCheckReqBody {
  teamId: string;
}

// Get form data by id. Create it if not existent, return as JSON.
export async function POST(req: NextRequest) {
  try {
    // Validate the user from request JWT Token in Request Header, returns user object if valid
    const validUserResponse = await validateUser(req);
    if (!resIsSuccess(validUserResponse)) return validUserResponse;
    const validUser = ((await validUserResponse.json()) as { user: Record<string,any> }).user;

    //check if user has permission to do action
    if (!(await roleHasPermissionServerSide(validUser, { selfAccount: 'create' }))) {
        return NextResponse.json({ message: 'User does not have permission' }, { status: 403 });
    }

    if (!validUser.officeId) {
        return NextResponse.json({ message: 'User is not part of any office' }, { status: 500 });
    }

    // Extract the data from the request body
    let { teamId } = (await req.json()) as HealthCheckReqBody;

    try {
      // Route logic
      return NextResponse.json({ message: "success" }, { status: 200 });
    } catch (error) {
      console.error("Error in API HealthCheck route", error);
      return NextResponse.json(
        {
          message: "Error in API HealthCheck route logic",
          error: error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in API HealthCheck route", error);
    return NextResponse.json({ message: "Error in decoding req body" }, { status: 500 });
  }
}