import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PAGES = ["/login", "/forgot-password", "/validate-code"];
const PUBLIC_APIS = ["/api/auth/login", "/api/auth/forgot-password", "/api/auth/validate-code"];

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request) {
  const { pathname } = request.nextUrl;


  const isPublicPage = PUBLIC_PAGES.includes(pathname);
  const isPublicAPI = PUBLIC_APIS.includes(pathname);
  const token = request.cookies.get("token");

  if (isPublicPage || isPublicAPI) {
    if (token) {
      try {
        const { payload } = await jwtVerify(token.value, JWT_SECRET);
        if (payload?.sub) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      } catch (err) {
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}


export const config = {
  matcher: [
    "/((?!_next|favicon.ico|manifest.json|workers|robots.txt|img|icons|static|offline|logo|fonts).*)",
  ],
};
