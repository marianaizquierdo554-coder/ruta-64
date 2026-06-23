import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Rutas públicas (no requieren login)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/seleccionar-rol(.*)",
  "/api/donar",          
  "/api/donar-dinero",   
  "/api/test-api",       
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId, redirectToSignIn } = await auth();

  // Si la ruta es pública, permitir acceso
  if (isPublicRoute(request)) {
    return;
  }

  // Si no está autenticado, redirigir a login
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: request.url });
  }

  // Si está autenticado, permitir acceso
  return;
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};