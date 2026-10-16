# Entregable E05 — Plan, Matriz y Resultados de Pruebas
**Proyecto:** Sistema de Trazabilidad de Cacao — Asociación Cacaotera del Huila  
**Equipo:** Brayan (Integrador / Lead), Samuel (Frontend), Backend (Termux)  
**Hackathon USCO 2026:** Reto Agroindustria (Cacao)  
**Fecha de Ejecución:** 15 de Octubre de 2026  

---

## 1. Resumen Ejecutivo de Calidad y Pruebas

Para garantizar el cumplimiento de los **12 Requerimientos Funcionales (RF01 a RF12)** y la fiabilidad del sistema bajo la rúbrica oficial (25 pts funcionamiento + 15 pts confiabilidad), se diseñó e implementó una estrategia de pruebas en dos capas:
1. **Capa Automatizada:** Suite de pruebas unitarias y de integración sobre reglas de negocio puras (`lib/business-rules.ts` y `tests/business-rules.test.ts`), ejecutada con el runner nativo de **Node.js v24 (`node:test`)**.
2. **Capa Manual E2E:** 15 casos de prueba ejecutados sobre el flujo completo del usuario (navegador, autenticación Clerk con roles, Server Actions y base de datos PostgreSQL en Supabase).

---

## 2. Reporte de Pruebas Automatizadas (5 Casos Oficiales E05)

### Comando de Ejecución:
```bash
npm test
```

### Salida Oficial de la Terminal:
```text
> cacao-trazabilidad@0.1.0 test
> node --test tests/*.test.ts

▶ Suite de Pruebas Automatizadas - Reto Trazabilidad Cacao (E05)
  ✔ RF04: Cálculo exacto de merma y activación de alertas si supera 15% (2.5ms)
  ✔ RF05 & RF12: Costeo unitario y cálculo de margen con salvaguarda de división por cero (0.8ms)
  ✔ RF01: Rechazo estricto de cantidades no positivas y campos obligatorios (1.6ms)
  ✔ RF08: Balance de inventario, rechazo de sobreconsumo e idempotencia de transacciones (0.9ms)
  ✔ RF09: Bloqueo de operadores no autorizados y validación de motivo en bloqueo de lotes (0.8ms)
✔ Suite de Pruebas Automatizadas - Reto Trazabilidad Cacao (E05) (26.4ms)
ℹ tests 6 | suites 0 | pass 6 | fail 0 | cancelled 0 | skipped 0
ℹ duration_ms 633.2
```

### Detalle de Cobertura Automatizada:
| Prueba Auto | Requisito | Escenario Evaluado | Resultado |
|---|---|---|---|
| **AUTO-01** | **RF04** | Fórmula oficial $((100 - 80) / 100) \times 100 = 20.0\%$. Disparo de `alerta_merma: true` si $> 15.0\%$, caso frontera $15.0\%$ sin alerta, y detección de anomalías si salida $>$ entrada. | **APROBADO (PASSED)** |
| **AUTO-02** | **RF05 / RF12** | Costeo unitario $\$1.600.000 / 80\text{ kg} = \$20.000\text{ COP/kg}$. Margen comercial $(25.000 - 20.000) / 25.000 = 20.0\%$. Salvaguarda matemática contra división por cero (retorna 0 sin `NaN` ni `Infinity`). | **APROBADO (PASSED)** |
| **AUTO-03** | **RF01** | Rechazo estricto de cantidades no positivas ($0\text{ kg}$, $-15\text{ kg}$, `NaN`), validación de campos requeridos (productor y origen). | **APROBADO (PASSED)** |
| **AUTO-04** | **RF08** | Descuento de saldo disponible. Rechazo inmediato de sobreconsumo ($120\text{ kg}$ solicitados vs $100\text{ kg}$ en existencia). Idempotencia: reintento con misma clave no duplica consumo. | **APROBADO (PASSED)** |
| **AUTO-05** | **RF09** | Restricción de permisos: rol `operador` o anónimo es rechazado al intentar bloquear o cambiar estado. Rol `admin` autorizado con exigencia de motivo técnico ($\ge 5$ caracteres) para el incidente de la Hora 12. | **APROBADO (PASSED)** |

---

## 3. Matriz de 15 Casos de Prueba Manuales (E05)

| ID | Requisito | Nombre del Caso | Precondición | Pasos de Ejecución | Datos de Entrada | Resultado Esperado | Resultado Obtenido | Estado |
|:---:|:---:|---|---|---|---|---|---|:---:|
| **CP01** | **RF01** | Recepción de nuevo lote válido | Usuario con sesión iniciada en `/lotes` | 1. Clic en "➕ Recibir Nuevo Lote"<br>2. Diligenciar productor, origen y kg<br>3. Clic en "Guardar Lote" | Productor: "Carlos Ortiz"<br>Origen: "Rivera"<br>Cantidad: `120 kg` | Se genera ID correlativo (ej. CAC004), nace en estado "Pendiente" y suma 120 kg al inventario. | Lote creado en Supabase con ID CAC004, visible en tabla e inventario actualizado. | **PASÓ** |
| **CP02** | **RF01** | Rechazo de cantidad no positiva ($\le 0$) | Modal de recepción abierto | 1. Ingresar productor y origen<br>2. Ingresar cantidad 0 o negativa<br>3. Clic en "Guardar Lote" | Productor: "Felipe Tovar"<br>Origen: "Algeciras"<br>Cantidad: `-10 kg` | Mensaje de error visible en rojo: "La cantidad recibida debe ser mayor a 0 kg (RF01)". No guarda en BD. | Modal muestra alerta roja y no permite la inserción en base de datos. | **PASÓ** |
| **CP03** | **RF01** | Validación de campos obligatorios en recepción | Modal de recepción abierto | 1. Dejar nombre de productor en blanco<br>2. Intentar enviar formulario | Productor: `""`<br>Origen: "Campoalegre"<br>Cantidad: `50 kg` | Validación bloquea el envío y exige ingresar el nombre del productor. | El formulario bloquea el envío indicando campo obligatorio. | **PASÓ** |
| **CP04** | **RF02 / RF04** | Transformación con merma normal ($\le 15\%$) | Lote CAC001 con saldo disponible en `/transformaciones` | 1. Seleccionar CAC001<br>2. Seleccionar "Secado"<br>3. Ingresar 50 kg entrada y 45 kg salida<br>4. Registrar | Lote: `CAC001`<br>Etapa: "Secado"<br>Entrada: `50 kg`<br>Salida: `45 kg` | Merma en vivo = 10.0%. Badge verde "Merma en rango aceptable". Guarda sin exigir incidencia. | Registrado exitosamente, badge verde del 10.0% e inventario descontado. | **PASÓ** |
| **CP05** | **RF04** | Transformación con merma crítica ($> 15\%$) y alerta | Lote con saldo disponible | 1. Ingresar 100 kg entrada y 80 kg salida | Entrada: `100 kg`<br>Salida: `80 kg` | Merma calculada = 20.0%. Aparece badge rojo "🚨 ALERTA: Supera el umbral del 15.0%". | Badge rojo visible inmediatamente con 20.0% de merma. | **PASÓ** |
| **CP06** | **RF04** | Obligatoriedad de justificación ante merma crítica | Formulario con merma del 20.0% | 1. Dejar campo de incidencia vacío<br>2. Clic en "Registrar" | Incidencia: `""` | Rechaza el registro: "Es obligatorio registrar una justificación técnica de la incidencia (RF04)". | Error rojo en pantalla; el registro no se ejecuta hasta justificar la causa. | **PASÓ** |
| **CP07** | **RF04** | Detección de anomalía de peso ($Salida > Entrada$) | Formulario de transformación | 1. Ingresar entrada 80 kg y salida 95 kg | Entrada: `80 kg`<br>Salida: `95 kg` | Bloqueo: "El peso de salida no puede superar al peso de entrada". | Validación rechaza la anomalía física del peso. | **PASÓ** |
| **CP08** | **RF05** | Cálculo y visibilidad de Costo Unitario de etapa | Formulario de transformación | 1. Ingresar costo etapa $1.600.000 COP<br>2. Salida 80 kg | Costo: `$1.600.000`<br>Salida: `80 kg` | El historial muestra el costo unitario exacto: `$20.000 COP/kg` ($1.600.000 / 80). | La tabla de historial despliega la columna con `$20.000/kg`. | **PASÓ** |
| **CP09** | **RF12** | Margen comercial y prevención de división por cero | Reglas financieras | 1. Evaluar función de margen con costo $20.000 y venta $25.000<br>2. Evaluar con venta $0 | Costo: `$20.000`<br>Venta: `$25.000`<br>Venta alternativa: `$0` | Caso 1: Margen = 20.0%.<br>Caso 2 (división por cero): Retorna 0% de forma segura sin romper la app. | Retorna 20.0% y 0% en salvaguarda (verificado en suite de pruebas). | **PASÓ** |
| **CP10** | **RF08** | Descuento atómico de existencias en bodega | Lote CAC001 con 100 kg iniciales | 1. Consumir 40 kg en una fermentación<br>2. Revisar saldo en `/lotes` y `/` | Entrada: `40 kg` | El saldo disponible baja exactamente a 60 kg en tiempo real. | Inventario refleja 60 kg disponibles calculados desde `inventario_movimientos`. | **PASÓ** |
| **CP11** | **RF08** | Bloqueo de sobreconsumo de inventario | Lote CAC003 con 80 kg disponibles | 1. Intentar consumir 100 kg de CAC003 | Lote: `CAC003`<br>Entrada solicitada: `100 kg` | Error: "Saldo insuficiente: disponible 80 kg, solicitado 100 kg (RF08)". No descuenta inventario. | La Server Action rechaza el consumo y no altera los registros de base de datos. | **PASÓ** |
| **CP12** | **RF08** | Protección de Idempotencia ante reintentos de red | Formulario con clave de idempotencia | 1. Enviar una transacción con IDTX único<br>2. Reenviar con la misma IDTX simulando duplicidad | `idempotency_key: "tx-trf-001"` | El segundo intento detecta la clave y responde con éxito sin volver a restar inventario. | Idempotencia confirmada; el saldo no sufre duplicación de descuento. | **PASÓ** |
| **CP13** | **RF09** | Restricción de permisos a rol Operador | Usuario autenticado con rol `operador` | 1. Intentar llamar al cambio de estado de lote | Rol: `operador` | Mensaje: "Acción denegada: Solo el Administrador tiene autorización para cambiar estados (RF09)". | Servidor rechaza la petición por validación estricta de rol. | **PASÓ** |
| **CP14** | **RF09** | Bloqueo administrativo con motivo (Simulación Hora 12) | Usuario Administrador en `/lotes` | 1. Clic en "🛡️ Cambiar Estado" en CAC001<br>2. Seleccionar "Bloqueado"<br>3. Diligenciar motivo fitosanitario<br>4. Confirmar | Lote: `CAC001`<br>Estado: "bloqueado"<br>Motivo: "Alerta fitosanitaria por exceso de humedad detectada en fermentación (Hora 12)." | El lote cambia a badge rojo "BLOQUEADO", se audita en `auditoria_logs` y queda inhabilitado para transformaciones. | Estado actualizado a bloqueado, trazabilidad pública refleja la alerta y el selector de transformaciones lo inhabilita. | **PASÓ** |
| **CP15** | **RF06** | Consulta en Ficha Pública (QR) sin costos internos | Usuario no autenticado (público) en `/trazabilidad` | 1. Buscar lote `CAC001`<br>2. Verificar datos visibles | Código: `CAC001` | Muestra productor, origen (Rivera, Huila), volumen, fecha y línea de tiempo. NO muestra costos, precios ni márgenes. | Ficha pública renderiza información agronómica completa garantizando la privacidad comercial. | **PASÓ** |

---

## 4. Conclusión de Calidad
- **Total Casos Automatizados:** 5/5 ejecutados con éxito (100% pass).
- **Total Casos Manuales:** 15/15 verificados en el entorno integrado (100% pass).
- **Robustez frente al Incidente de la Hora 12:** El sistema cuenta con control transaccional e inmutabilidad garantizada para la simulación de bloqueo de emergencia.
