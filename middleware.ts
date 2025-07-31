// middleware.ts

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import arcjet, { detectBot, shield , createMiddleware} from '@arcjet/next';

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/transaction(.*)"
]);

const myClerkMiddleware = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }
});

export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  log: console, // ✅ this is the fix — using the built-in console logger
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"],
    }),
  ],
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

export default createMiddleware(aj, myClerkMiddleware);
