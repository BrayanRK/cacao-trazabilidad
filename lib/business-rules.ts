/**
 * Reglas de Negocio Oficiales - Reto Trazabilidad de Cacao
 * Cubre: RF01, RF04, RF05, RF08, RF09, RF12
 * Cumplimiento del entregable E05 (Pruebas Automatizadas)
 */

export interface RecepcionLoteInput {
  productor: string;
  origen: string;
  cantidad: number;
  unidad?: string;
}

export interface ResultadoValidacion {
  valido: boolean;
  error?: string;
}

/**
 * RF01: Validación de Recepción de Lotes
 * - Rechazar cantidades no positivas (<= 0 o NaN)
 * - Productor y origen obligatorios
 */
export function validarRecepcionLote(data: RecepcionLoteInput): ResultadoValidacion {
  const cantidad = Number(data.cantidad);

  if (isNaN(cantidad) || cantidad <= 0) {
    return {
      valido: false,
      error: "La cantidad recibida debe ser mayor a 0 kg (RF01).",
    };
  }

  if (!data.productor || data.productor.trim().length === 0) {
    return {
      valido: false,
      error: "El nombre del productor es obligatorio.",
    };
  }

  if (!data.origen || data.origen.trim().length === 0) {
    return {
      valido: false,
      error: "El municipio de origen es obligatorio.",
    };
  }

  return { valido: true };
}

export interface ResultadoMerma {
  merma_kg: number;
  merma_pct: number;
  alerta_merma: boolean;
  anomalia: boolean;
  requiere_incidencia: boolean;
  error?: string;
}

/**
 * RF04: Cálculo de Merma y Detección de Alertas
 * Fórmula: Merma (%) = ((Peso_Entrada - Peso_Salida) / Peso_Entrada) * 100
 * Alerta: Si merma_pct > 15.0%, alerta_merma = true y requiere registro de incidencia
 */
export function calcularMerma(entradaKg: number, salidaKg: number): ResultadoMerma {
  const entrada = Number(entradaKg);
  const salida = Number(salidaKg);

  if (isNaN(entrada) || entrada <= 0) {
    return {
      merma_kg: 0,
      merma_pct: 0,
      alerta_merma: false,
      anomalia: true,
      requiere_incidencia: false,
      error: "El peso de entrada debe ser estrictamente mayor a 0 kg.",
    };
  }

  if (isNaN(salida) || salida < 0) {
    return {
      merma_kg: 0,
      merma_pct: 0,
      alerta_merma: false,
      anomalia: true,
      requiere_incidencia: false,
      error: "El peso de salida no puede ser negativo.",
    };
  }

  // Anomalía: salida mayor a entrada
  if (salida > entrada) {
    return {
      merma_kg: entrada - salida,
      merma_pct: 0,
      alerta_merma: true,
      anomalia: true,
      requiere_incidencia: true,
      error: "Anomalía detectada: El peso de salida no puede ser mayor al peso de entrada.",
    };
  }

  const mermaKg = Number((entrada - salida).toFixed(4));
  const mermaPct = Number((((entrada - salida) / entrada) * 100).toFixed(2));
  const alertaMerma = mermaPct > 15.0;

  return {
    merma_kg: mermaKg,
    merma_pct: mermaPct,
    alerta_merma: alertaMerma,
    anomalia: false,
    requiere_incidencia: alertaMerma,
  };
}

/**
 * RF05: Costeo por etapa (Costo unitario por kg resultante)
 * Fórmula: Costo_Unitario = Costo_Total_Etapa / Cantidad_Salida_Kg
 * Incluye salvaguarda de división por cero
 */
export function calcularCostoUnitario(costoTotal: number, salidaKg: number): number {
  const costo = Number(costoTotal);
  const salida = Number(salidaKg);

  if (isNaN(costo) || costo <= 0 || isNaN(salida) || salida <= 0) {
    return 0; // Salvaguarda división por cero
  }

  return Number((costo / salida).toFixed(2));
}

/**
 * RF12: Margen comercial con salvaguarda de división por cero
 * Fórmula: Margen (%) = ((Precio_Venta - Costo_Unitario) / Precio_Venta) * 100
 */
export function calcularMargen(costoUnitario: number, precioVenta: number): number {
  const costo = Number(costoUnitario);
  const venta = Number(precioVenta);

  if (isNaN(venta) || venta <= 0 || isNaN(costo) || costo < 0) {
    return 0; // Salvaguarda contra división por cero o NaN
  }

  const margen = ((venta - costo) / venta) * 100;
  return Number(margen.toFixed(2));
}

export interface ValidacionConsumoInput {
  saldoDisponible: number;
  cantidadAConsumir: number;
  idempotencyKey?: string | null;
  keysProcesadas?: string[];
}

export interface ResultadoConsumo {
  permitido: boolean;
  sobreconsumo: boolean;
  yaProcesado: boolean;
  nuevoSaldo?: number;
  error?: string;
}

/**
 * RF08: Balance de Inventario, Prevención de Sobreconsumo e Idempotencia
 */
export function validarConsumoInventario(input: ValidacionConsumoInput): ResultadoConsumo {
  const { saldoDisponible, cantidadAConsumir, idempotencyKey, keysProcesadas = [] } = input;

  // Verificación de idempotencia
  if (idempotencyKey && keysProcesadas.includes(idempotencyKey)) {
    return {
      permitido: false,
      sobreconsumo: false,
      yaProcesado: true,
      error: "Operación ya procesada previamente (Idempotencia activa).",
    };
  }

  const solicitado = Number(cantidadAConsumir);
  const disponible = Number(saldoDisponible);

  if (isNaN(solicitado) || solicitado <= 0) {
    return {
      permitido: false,
      sobreconsumo: false,
      yaProcesado: false,
      error: "La cantidad a consumir debe ser mayor a 0 kg.",
    };
  }

  // Prevención de sobreconsumo
  if (solicitado > disponible) {
    return {
      permitido: false,
      sobreconsumo: true,
      yaProcesado: false,
      error: `Saldo insuficiente: disponible ${disponible} kg, solicitado ${solicitado} kg (RF08).`,
    };
  }

  return {
    permitido: true,
    sobreconsumo: false,
    yaProcesado: false,
    nuevoSaldo: Number((disponible - solicitado).toFixed(4)),
  };
}

export interface ValidacionPermisoEstadoInput {
  rolUsuario: string | null | undefined;
  nuevoEstado: "pendiente" | "liberado" | "bloqueado";
  motivo?: string | null;
}

/**
 * RF09: Control de Roles y Bloqueo Administrativo (Simulación Hora 12)
 * Solo el Administrador puede cambiar el estado o bloquear.
 * Motivo obligatorio mínimo 5 caracteres.
 */
export function validarPermisoCambioEstado(input: ValidacionPermisoEstadoInput): ResultadoValidacion {
  const { rolUsuario, motivo } = input;

  if (rolUsuario !== "admin") {
    return {
      valido: false,
      error: "Acción denegada: Solo el Administrador tiene autorización para cambiar estados o bloquear lotes (RF09).",
    };
  }

  if (!motivo || motivo.trim().length < 5) {
    return {
      valido: false,
      error: "Es obligatorio registrar un motivo detallado para el cambio de estado (mínimo 5 caracteres).",
    };
  }

  return { valido: true };
}
