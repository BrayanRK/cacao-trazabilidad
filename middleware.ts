import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Rutas públicas accesibles sin iniciar sesión:
// - Inicio (/)
// - Login y registro (/sign-in, /sign-up)
// - Ficha Comercial Pública por QR (/trazabilidad/*) -> Requisito RF06
// - Vistas de inventario y procesos para operadores/móvil
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/trazabilidad(.*)",
  "/lotes(.*)",
  "/transformaciones(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const host = req.headers.get("host") || "";
  const isLocalIp = host.startsWith("192.168.") || host.startsWith("10.") || host.startsWith("172.");

  // En rutas públicas o accesos móviles por IP local, permitir paso directo sin bucles de sesión
  if (isPublicRoute(req) || isLocalIp) {
    return NextResponse.next();
  }

  await auth.protect();
});

export const config = {
  matcher: [
    // Omitir archivos estáticos y rutas internas de Next.js
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Ejecutar siempre para rutas API
    "/(api|trpc)(.*)",
  ],
};
