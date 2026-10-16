import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Rutas públicas accesibles sin iniciar sesión:
// - Inicio (/)
// - Login y registro (/sign-in, /sign-up)
// - Ficha Comercial Pública por QR (/trazabilidad/publica/*) -> Requisito RF06
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/trazabilidad(.*)",
  "/lotes(.*)",
  "/transformaciones(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Omitir archivos estáticos y rutas internas de Next.js
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Ejecutar siempre para rutas API
    "/(api|trpc)(.*)",
  ],
};
