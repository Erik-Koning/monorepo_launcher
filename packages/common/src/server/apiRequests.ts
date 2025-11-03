import { NextRequest } from "next/server";

//ISO 3166-1 alpha-2 country code
//Countries to serve
export const serveCountries: string[] | undefined = ["US", "CA"];
//Countries to deny, in case countries to serve not set
export const denyCountries: string[] | undefined = undefined;

// Type guard for NextRequest
export function isNextRequest(req: any): req is NextRequest {
  // Check if req is an instance of NextRequest
  if (req instanceof NextRequest) {
    return true;
  }

  // Alternatively, check for properties unique to NextRequest
  //return req?.cookies !== undefined && req?.headers !== undefined && typeof req?.nextUrl !== "undefined";
  // For example, the presence of the 'nextUrl' property and 'cookies' object
  if (req && typeof req === "object" && req?.headers !== undefined && req?.cookies !== undefined && req?.nextUrl !== undefined) {
    return true;
  }

  return false;
}

export function isGetRequest(req: reqTypes): boolean {
  return isNextRequest(req) && req.method === "GET";
}

/**
 * Extracts an IP address from either an APIGatewayProxyEventV2 or NextRequest.
 */
export type reqTypes =
  | NextRequest
  | {
      [key: string]: any;
      headers?: Record<string, string> | Headers | undefined;
    };

export function getIp(req: reqTypes, debug: boolean = false): string {
  if (debug) console.info("getIp in getIp", req);
  const headers = req?.headers;
  if (!headers) {
    return "Unknown IP";
  }
  if (headers instanceof Headers) {
    return headers.get("x-forwarded-for") ?? "Unknown IP";
  }
  return headers["x-forwarded-for"] ?? "Unknown IP";
}

//Returns the ISO 3166-1 alpha-2 country code
export function getReqCountry(req: reqTypes, debug: boolean = false): string {
  if (debug) console.info("getReqCountry in getReqCountry", req);
  if (isNextRequest(req)) {
    // Running in Next.js environment (Edge / App Router)
    // On Vercel, you might get 'x-vercel-ip-country'.
    // Or if CloudFront is fronting your Next app, you could see CloudFront-Viewer-Country.
    if (debug)
      console.info(
        "getReqCountry in NextRequest",
        req.headers.get("x-open-next-country"),
        req.headers.get("cloudfront-viewer-country"),
        req.headers.get("x-vercel-ip-country"),
        req.headers.get("CloudFront-Viewer-Country")
      );
    const country =
      req.headers.get("x-open-next-country") ||
      req.headers.get("cloudfront-viewer-country") ||
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("CloudFront-Viewer-Country");

    return country ?? "";
  } else {
    // Fallback if neither APIGatewayProxyEventV2 nor NextRequest
    // Possibly look at a custom country header if you have one
    const headers = req?.headers;
    if (!headers) {
      return "";
    }

    const getHeader = (key: string) => {
      if (headers instanceof Headers) {
        return headers.get(key);
      }
      return headers[key];
    };

    if (debug)
      console.info(
        "getReqCountry in fallback",
        getHeader("x-open-next-country"),
        getHeader("cloudfront-viewer-country"),
        getHeader("CloudFront-Viewer-Country"),
        getHeader("x-country"),
        getHeader("x-vercel-ip-country")
      );
    const fallbackCountry =
      getHeader("x-open-next-country") ||
      getHeader("cloudfront-viewer-country") ||
      getHeader("CloudFront-Viewer-Country") ||
      getHeader("x-country") ||
      getHeader("x-vercel-ip-country");

    return fallbackCountry ?? "";
  }
}

/**
 * Returns the city of the request.
 */
export function getReqCity(req: reqTypes): string {
  const headers = req?.headers;
  if (!headers) {
    return "";
  }

  const getHeader = (key: string) => {
    if (headers instanceof Headers) {
      return headers.get(key);
    }
    return headers[key];
  };

  const city = getHeader("x-open-next-city") || getHeader("cloudfront-viewer-city") || getHeader("x-city");

  return city ?? "";
}

/**
 * Looks for "region" or "country-region" in known headers:
 * - On Vercel, there's no built-in region header for the *visitor*,
 *   but "x-vercel-ip-country-region" might be set in some edge configurations.
 * - On AWS, you might pass a custom "CloudFront-Viewer-Region" if using geolocation at distribution level.
 */
export function getReqCountryRegion(req: reqTypes): string {
  const headers = req?.headers;
  if (!headers) {
    return "";
  }

  const getHeader = (key: string) => {
    if (headers instanceof Headers) {
      return headers.get(key);
    }
    return headers[key];
  };

  const region =
    getHeader("x-open-next-country-region") ||
    getHeader("cloudfront-viewer-country-region") ||
    getHeader("Cloudfront-Viewer-Country-Region") ||
    getHeader("x-vercel-ip-country-region") ||
    getHeader("x-region");

  return region ?? "";
}

export function getReqLatLong(req: reqTypes): string {
  const headers = req?.headers;
  if (!headers) {
    return "";
  }

  const getHeader = (key: string) => {
    if (headers instanceof Headers) {
      return headers.get(key);
    }
    return headers[key];
  };

  const lat = (getHeader("x-open-next-latitude") || getHeader("cloudfront-viewer-latitude")) ?? "";
  const long = (getHeader("x-open-next-longitude") || getHeader("cloudfront-viewer-longitude")) ?? "";

  if (!lat && !long) return "";
  return lat + "," + long;
}

export interface userIPs {
  ip: string;
  verified: Date | null;
  country: string;
  region: string;
  city: string;
  latLong?: string;
  lastLogin?: Date | null;
}

export function generateNewIPDetails(req: reqTypes, verified?: boolean): userIPs {
  const IP = getIp(req); //works for nextRequest, APIGatewayevent, and BetterAuth request obj
  const IPCounty = getReqCountry(req);
  const IPCity = getReqCity(req);
  const IPRegion = getReqCountryRegion(req);
  const IPLatLong = getReqLatLong(req);
  return {
    ip: IP,
    city: IPCity,
    country: IPCounty,
    region: IPRegion,
    latLong: IPLatLong,
    lastLogin: null,
    verified: verified ? new Date() : null,
  } satisfies userIPs;
}
