import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes (no authentication required)
const isPublicRoute = createRouteMatcher([
  '/', // Allow unrestricted access to the home page
  '/sign-in(.*)', // Sign-in page
  '/sign-up(.*)', // Sign-up page
  '/api/clerk/webhook(.*)', // Clerk webhook
]);

export default clerkMiddleware(async (auth, request) => {
  // If the route is not public, require authentication
  if (!isPublicRoute(request)) {
    await auth.protect(); // Protect private routes
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
