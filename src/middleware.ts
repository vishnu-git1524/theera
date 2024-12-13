import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes (no authentication required)
const isPublicRoute = createRouteMatcher([
  '/', // Home page
  '/sign-in(.*)', // Sign-in page
  '/sign-up(.*)', // Sign-up page
  '/api/clerk/webhook(.*)', // Clerk webhook
  '/api/webhook/stripe(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  try {
    // Log for debugging purposes
    console.log("Request Path:", request.nextUrl.pathname);

    // If the route is not public, ensure authentication
    if (!isPublicRoute(request)) {
      console.log("Protecting private route");
      await auth.protect();
    } else {
      console.log("Public route detected, no authentication required");
    }
  } catch (error) {
    console.error("Error in Clerk Middleware:", error);
    return new Response(JSON.stringify({ error: "Authentication error" }), { status: 401 });
  }
});

export const config = {
  matcher: [
    // Ignore Next.js internals and static files unless required
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always handle API & TRPC routes
    '/(api|trpc)(.*)',
  ],
};
