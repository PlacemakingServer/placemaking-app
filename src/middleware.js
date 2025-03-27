import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  PUBLIC_PAGES,
  PUBLIC_APIS,
  AUTHENTICATED_PAGES,
  ROLE_PERMISSIONS,
} from "@/config/routes";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const isPublicRoute = PUBLIC_PAGES.includes(pathname) || PUBLIC_APIS.includes(pathname);

  let payload = null;
  if (token) {
    try {
      const { payload: verifiedPayload } = await jwtVerify(token, JWT_SECRET);
      payload = verifiedPayload;
    } catch (error) {
      // Token inválido ou expirado: payload continua null
    }
  }
  console.log(token);

  
  if (isPublicRoute) {
    if (payload?.sub) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!payload?.sub) {
    return NextResponse.redirect(new URL("/login", request.url));
  }


  if (AUTHENTICATED_PAGES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const allowedRoutes = ROLE_PERMISSIONS[payload.role] || [];
  if (!allowedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|manifest.json|workers|robots.txt|img|icons|static|offline|logo|fonts).*)",
  ],
};
