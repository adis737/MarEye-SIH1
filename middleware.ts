import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const protectedPaths = ["/"];
	const isProtected = protectedPaths.includes(pathname);

	if (isProtected) {
		const isAuthenticated = Boolean(request.cookies.get("auth_token")?.value);
		if (!isAuthenticated) {
			const url = request.nextUrl.clone();
			url.pathname = "/try";
			return NextResponse.redirect(url);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/"],
};
