import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isProtected = req.nextUrl.pathname.startsWith("/dashboard") || 
                      req.nextUrl.pathname.startsWith("/learn") || 
                      req.nextUrl.pathname.startsWith("/practice") || 
                      req.nextUrl.pathname.startsWith("/portal");
                      
  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
