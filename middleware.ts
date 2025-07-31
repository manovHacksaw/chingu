import { createMiddleware } from '@arcjet/next';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import arcjet, { detectBot, shield } from 'arcjet';

export const clerkMiddleware(async(auth, req)=>{
  const {userId} = await auth();

  if(!userId && isProtectedRoute(req)){
    const {redirectToSignIn} = await auth();
    return redirectToSignIn();
  } 
});

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)"  
])

export const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules:[
    shield({
      mode: "LIVE"
    }),
    detectBot({
      mode: "LIVE",
      allow:[
        "CATEGORY:SEARCH_ENGINE",
        "GO_HTTP"
      ]
    })
  ]
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

export default createMiddleware(aj, clerkMiddleware);