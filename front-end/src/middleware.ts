import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // Use getToken from next-auth/jwt to read the session token securely on Edge runtime
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET 
  });

  const { pathname } = req.nextUrl;
  
  // Define public and auth-specific routes
  const isAuthRoute = pathname.startsWith("/api/auth");
  const isPublicRoute = pathname === "/";

  // If the user is NOT logged in and trying to access a protected route (anything other than root or auth APIs)
  if (!token && !isPublicRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If the user IS logged in and tries to access the login page, seamlessly redirect them to the portal
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/portal", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protect all routes except Next.js internals and static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
