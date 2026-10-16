# Contrato de datos (backend a frontend)

## Tablas y vistas
- lotes: id, productor, origen, fecha_recepcion, cantidad_recibida, cantidad_consumida, unidad, estado
- v_transformaciones: lote_origen, etapa, entrada, salida, merma_pct, alerta_merma, costo_unitario
- ficha_publica (sin login): codigo, origen, fecha_recepcion, estado

## Funciones (se llaman con supabase.rpc)
- registrar_transformacion(p_key, p_lote, p_etapa, p_responsable, p_entrada, p_salida, p_costo, p_incidencias)
- cambiar_estado(p_lote, p_estado, p_motivo)  -- solo admin

## Errores que puede devolver
- Existencia insuficiente. Disponible: X
- Solo el administrador puede cambiar el estado
- El lote está bloqueado
