import test from "node:test";
import assert from "node:assert/strict";
import {
  calcularMerma,
  calcularCostoUnitario,
  calcularMargen,
  validarRecepcionLote,
  validarConsumoInventario,
  validarPermisoCambioEstado,
} from "../lib/business-rules.ts";

test("Suite de Pruebas Automatizadas - Reto Trazabilidad Cacao (E05)", async (t) => {
  // =========================================================================
  // TEST 1: RF04 - Cálculo de Merma y Detección de Alertas (> 15%)
  // =========================================================================
  await t.test("RF04: Cálculo exacto de merma y activación de alertas si supera 15%", () => {
    // 1. Caso estándar con merma > 15% (100 kg entrada, 80 kg salida = 20% merma)
    const resultadoAlerta = calcularMerma(100, 80);
    assert.strictEqual(resultadoAlerta.merma_kg, 20);
    assert.strictEqual(resultadoAlerta.merma_pct, 20.0);
    assert.strictEqual(resultadoAlerta.alerta_merma, true);
    assert.strictEqual(resultadoAlerta.requiere_incidencia, true);

    // 2. Caso normal sin alerta (100 kg entrada, 90 kg salida = 10% merma)
    const resultadoNormal = calcularMerma(100, 90);
    assert.strictEqual(resultadoNormal.merma_kg, 10);
    assert.strictEqual(resultadoNormal.merma_pct, 10.0);
    assert.strictEqual(resultadoNormal.alerta_merma, false);

    // 3. Caso frontera exacto: 15% de merma (100 kg entrada, 85 kg salida = 15.0%) -> No dispara alerta
    const resultadoFrontera = calcularMerma(100, 85);
    assert.strictEqual(resultadoFrontera.merma_pct, 15.0);
    assert.strictEqual(resultadoFrontera.alerta_merma, false);

    // 4. Caso frontera superior: 15.1% de merma -> Dispara alerta
    const resultadoFronteraAlerta = calcularMerma(100, 84.9);
    assert.strictEqual(resultadoFronteraAlerta.merma_pct, 15.1);
    assert.strictEqual(resultadoFronteraAlerta.alerta_merma, true);

    // 5. Caso anomalía: Salida superior a la entrada
    const resultadoAnomalia = calcularMerma(100, 110);
    assert.strictEqual(resultadoAnomalia.anomalia, true);
    assert.strictEqual(resultadoAnomalia.alerta_merma, true);
  });

  // =========================================================================
  // TEST 2: RF05 & RF12 - Costeo Unitario por Etapa y Margen Comercial
  // =========================================================================
  await t.test("RF05 & RF12: Costeo unitario y cálculo de margen con salvaguarda de división por cero", () => {
    // 1. Costeo oficial RF05: $1.600.000 COP acumulados en 80 kg = $20.000 COP/kg
    const costoUnitario = calcularCostoUnitario(1600000, 80);
    assert.strictEqual(costoUnitario, 20000);

    // 2. Margen comercial oficial RF12: Costo $20.000, Precio Venta $25.000 = 20.0%
    const margen = calcularMargen(20000, 25000);
    assert.strictEqual(margen, 20.0);

    // 3. Salvaguarda división por cero en costo unitario (salida 0 kg)
    const costoCero = calcularCostoUnitario(1600000, 0);
    assert.strictEqual(costoCero, 0);
    assert.strictEqual(Number.isFinite(costoCero), true);

    // 4. Salvaguarda división por cero en margen (precio venta 0 COP)
    const margenCero = calcularMargen(20000, 0);
    assert.strictEqual(margenCero, 0);
    assert.strictEqual(Number.isFinite(margenCero), true);
  });

  // =========================================================================
  // TEST 3: RF01 - Validación Estricta de Recepción de Lotes
  // =========================================================================
  await t.test("RF01: Rechazo estricto de cantidades no positivas y campos obligatorios", () => {
    // 1. Recepción válida
    const loteValido = validarRecepcionLote({
      productor: "Carlos Ortiz",
      origen: "Rivera",
      cantidad: 100,
    });
    assert.strictEqual(loteValido.valido, true);

    // 2. Rechazo cantidad cero (<= 0)
    const loteCero = validarRecepcionLote({
      productor: "Carlos Ortiz",
      origen: "Rivera",
      cantidad: 0,
    });
    assert.strictEqual(loteCero.valido, false);
    assert.match(loteCero.error || "", /mayor a 0 kg/);

    // 3. Rechazo cantidad negativa
    const loteNegativo = validarRecepcionLote({
      productor: "Carlos Ortiz",
      origen: "Rivera",
      cantidad: -15,
    });
    assert.strictEqual(loteNegativo.valido, false);

    // 4. Rechazo productor vacío
    const loteSinProductor = validarRecepcionLote({
      productor: "",
      origen: "Rivera",
      cantidad: 100,
    });
    assert.strictEqual(loteSinProductor.valido, false);

    // 5. Rechazo origen vacío
    const loteSinOrigen = validarRecepcionLote({
      productor: "Carlos Ortiz",
      origen: "   ",
      cantidad: 100,
    });
    assert.strictEqual(loteSinOrigen.valido, false);
  });

  // =========================================================================
  // TEST 4: RF08 - Balance de Inventario, Prevención de Sobreconsumo e Idempotencia
  // =========================================================================
  await t.test("RF08: Balance de inventario, rechazo de sobreconsumo e idempotencia de transacciones", () => {
    // 1. Consumo permitido: Disponible 100 kg, se consumen 40 kg -> Restan 60 kg
    const consumoValido = validarConsumoInventario({
      saldoDisponible: 100,
      cantidadAConsumir: 40,
    });
    assert.strictEqual(consumoValido.permitido, true);
    assert.strictEqual(consumoValido.nuevoSaldo, 60);

    // 2. Bloqueo de sobreconsumo: Disponible 100 kg, se intentan consumir 120 kg
    const sobreconsumo = validarConsumoInventario({
      saldoDisponible: 100,
      cantidadAConsumir: 120,
    });
    assert.strictEqual(sobreconsumo.permitido, false);
    assert.strictEqual(sobreconsumo.sobreconsumo, true);
    assert.match(sobreconsumo.error || "", /Saldo insuficiente/);

    // 3. Consumo exacto del saldo total: Disponible 100 kg, se consumen 100 kg -> Restan 0 kg
    const consumoTotal = validarConsumoInventario({
      saldoDisponible: 100,
      cantidadAConsumir: 100,
    });
    assert.strictEqual(consumoTotal.permitido, true);
    assert.strictEqual(consumoTotal.nuevoSaldo, 0);

    // 4. Protección de Idempotencia: Clave ya procesada anteriormente
    const reintentoDuplicado = validarConsumoInventario({
      saldoDisponible: 100,
      cantidadAConsumir: 40,
      idempotencyKey: "tx-ferm-cac001-uuid-001",
      keysProcesadas: ["tx-ferm-cac001-uuid-001"],
    });
    assert.strictEqual(reintentoDuplicado.permitido, false);
    assert.strictEqual(reintentoDuplicado.yaProcesado, true);
  });

  // =========================================================================
  // TEST 5: RF09 - Control de Roles y Bloqueo Administrativo (Simulación Hora 12)
  // =========================================================================
  await t.test("RF09: Bloqueo de operadores no autorizados y validación de motivo en bloqueo de lotes", () => {
    // 1. Intento de cambio de estado por operador -> DENEGADO
    const intentoOperador = validarPermisoCambioEstado({
      rolUsuario: "operador",
      nuevoEstado: "bloqueado",
      motivo: "Presencia de hongos observada",
    });
    assert.strictEqual(intentoOperador.valido, false);
    assert.match(intentoOperador.error || "", /Solo el Administrador tiene autorización/);

    // 2. Intento de cambio por usuario anónimo / público -> DENEGADO
    const intentoAnonimo = validarPermisoCambioEstado({
      rolUsuario: null,
      nuevoEstado: "liberado",
      motivo: "Revisión técnica superada",
    });
    assert.strictEqual(intentoAnonimo.valido, false);

    // 3. Intento de Administrador sin motivo -> RECHAZADO (motivo obligatorio)
    const adminSinMotivo = validarPermisoCambioEstado({
      rolUsuario: "admin",
      nuevoEstado: "bloqueado",
      motivo: "",
    });
    assert.strictEqual(adminSinMotivo.valido, false);
    assert.match(adminSinMotivo.error || "", /motivo detallado/);

    // 4. Bloqueo exitoso por Administrador con motivo detallado (Simulación Hora 12 - CAC001)
    const bloqueoExitoso = validarPermisoCambioEstado({
      rolUsuario: "admin",
      nuevoEstado: "bloqueado",
      motivo: "Incidencia fitosanitaria detectada en inspección de fermentación (Hora 12).",
    });
    assert.strictEqual(bloqueoExitoso.valido, true);
  });
});
