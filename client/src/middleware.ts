
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "./providers/auth";

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === "/auth";

  // Get the token from the cookies since localStorage is not available in middleware
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  // Redirect logic
  if (isPublicPath && token) {
    // If user is already logged in and tries to access public path,
    // redirect to home page according to role
   return NextResponse.redirect(new URL(`/${role?.toLowerCase()}`, request.url));
  }

  if (!isPublicPath && !token) {
    // If user is not logged in and tries to access protected route,
    // redirect to auth page
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

// Configure the paths that middleware should run on
export const config = {
  matcher: [
    "/",
    "/auth",
    // Add other protected routes here
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
