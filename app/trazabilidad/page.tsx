import { getFichaPublicaAction, getLoteIdsPublicAction } from "@/app/actions/trazabilidad";
import TrazabilidadClient from "./TrazabilidadClient";

export default async function TrazabilidadPage({
  searchParams,
}: {
  searchParams: Promise<{ lote?: string }>;
}) {
  const resolvedParams = await searchParams;
  const ids = await getLoteIdsPublicAction();
  // Si no se especifica lote en la URL, seleccionar el último lote creado (o CAC001)
  const requestedLote = (resolvedParams?.lote || ids[ids.length - 1] || "CAC001").trim().toUpperCase();
  const initialFicha = await getFichaPublicaAction(requestedLote);

  return (
    <TrazabilidadClient
      initialLoteId={requestedLote}
      initialFicha={initialFicha}
      listaLotes={ids}
    />
  );
}
