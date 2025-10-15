import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	// Simple middleware that doesn't cause eval issues
	// Only protect specific authenticated routes
	const { pathname } = request.nextUrl;
	
	if (pathname.startsWith("/profile") || pathname.startsWith("/analytics")) {
		const authToken = request.cookies.get("auth_token");
		if (!authToken) {
			return NextResponse.redirect(new URL("/auth/login", request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/profile/:path*", "/analytics/:path*"],
};
