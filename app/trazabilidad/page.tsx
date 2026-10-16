import React, { Suspense } from "react";
import TrazabilidadClient from "./TrazabilidadClient";

export default function TrazabilidadPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <div className="animate-spin text-3xl">🌱</div>
          <p className="text-sm font-semibold">Cargando sistema de trazabilidad...</p>
        </div>
      }
    >
      <TrazabilidadClient />
    </Suspense>
  );
}
