import { auth } from "../auth";

const publicRoutes = [
    "/",
]

const authRoutes = [
    "/auth/login",
    "/auth/register"
]

const apiAuthPrefix = "api/auth";

export default auth((req: any) => {
    // req.auth
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isApiAuthRoute = nextUrl.pathname.includes(apiAuthPrefix);

    if (isApiAuthRoute) {
        return null
    }

    if (!isPublicRoute && !isLoggedIn) {
        console.log("=================ROUTE", req.nextUrl.pathname);
        return Response.redirect(new URL("/", req.url));
    }

    return null
});

// Optionally, don't invoke Middleware on some paths
export const config = {
    matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"],
};