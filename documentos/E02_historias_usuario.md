# Entregable E02 — Matriz Oficial de Historias de Usuario (12 HUs)
**Proyecto:** Sistema de Trazabilidad de Cacao — Asociación Cacaotera del Huila  
**Reto:** Cacao con historia, calidad y valor (Hackathon USCO 2026)  
**Equipo:** Brayan (Integrador), Samuel (Frontend), El Verde (Backend)  
**Total de Historias:** 12 Historias de Usuario detalladas con Criterios de Aceptación  

---

## Matriz de Historias de Usuario

### HU-01: Navegación Global y Autenticación de Usuarios
- **Rol:** Como usuario del sistema (operario, supervisor o administrador).
- **Necesidad:** Quiero una barra de navegación fija e intuitiva con la identidad visual del Huila, enlaces a todos los módulos y el control de mi perfil.
- **Beneficio:** Para desplazarme ágilmente entre los módulos de la planta sin perder el contexto de mi sesión.
- **Prioridad:** Alta.
- **Criterios de Aceptación:**
  1. La barra es fija (`sticky top-0`) y visible en todas las páginas.
  2. Muestra el badge oficial "Huila" y enlaces a Lotes, Transformaciones y Consulta Pública.
  3. Despliega el botón de inicio de sesión si no hay usuario, o el `UserButton` con el rol actual si está autenticado.
- **Componentes:** `app/navbar.tsx`, `app/layout.tsx`.

---

### HU-02: Protección de Rutas mediante Middleware
- **Rol:** Como administrador del sistema.
- **Necesidad:** Quiero que las vistas operativas privadas requieran autenticación obligatoria y que la consulta pública sea accesible para cualquier comprador.
- **Beneficio:** Para proteger los datos estratégicos de la asociación y evitar accesos no autorizados a la bodega.
- **Prioridad:** Alta.
- **Criterios de Aceptación:**
  1. Si un usuario no autenticado ingresa a `/lotes` o `/transformaciones`, es redirigido al modal de inicio de sesión.
  2. La ruta `/trazabilidad` y la página pública principal permiten lectura sin iniciar sesión.
- **Componentes:** `middleware.ts`.

---

### HU-03: Panel de Control (Dashboard Principal con Métricas)
- **Rol:** Como gerente de la asociación o supervisor de acopio.
- **Necesidad:** Quiero un panel de control con indicadores de volumen total, lotes registrados y procesos activos calculados desde la base de datos.
- **Beneficio:** Para tener una visión global en tiempo real del estado productivo del cacao huilense.
- **Prioridad:** Media.
- **Criterios de Aceptación:**
  1. Muestra tarjetas con conteo de lotes en bodega, kg totales y transformaciones realizadas.
  2. Los datos provienen de consultas reales en Supabase (`getLotesAction()`).
  3. Contiene accesos directos a los 3 módulos principales del sistema.
- **Componentes:** `app/page.tsx`.

---

### HU-04: Recepción de Materia Prima y Registro de Lotes (RF01)
- **Rol:** Como operario de báscula / acopio.
- **Necesidad:** Quiero registrar los lotes de cacao en baba o seco entrantes con su productor, municipio de origen y peso en kg.
- **Beneficio:** Para iniciar la cadena de trazabilidad desde el primer punto de contacto en la planta.
- **Prioridad:** Alta (Requisito Fundamental RF01).
- **Criterios de Aceptación:**
  1. Genera un identificador único correlativo (ej. `CAC001`, `CAC002`, `CAC004`).
  2. Rechaza cantidades no positivas ($\le 0\text{ kg}$, negativas o nulas) con mensaje de error visible.
  3. Todo lote nace automáticamente en estado `pendiente`.
  4. Suma el inventario inicial en `inventario_movimientos`.
- **Componentes:** `app/lotes/page.tsx`, `app/actions/lotes.ts`.

---

### HU-05: Módulo de Transformaciones Post-Cosecha (RF02)
- **Rol:** Como supervisor de procesos de planta.
- **Necesidad:** Quiero registrar las etapas de transformación (fermentación, secado, trillado, tostado) asociando los kg consumidos y los kg obtenidos.
- **Beneficio:** Para documentar el ciclo completo de procesamiento del cacao y enlazar la salida a su lote de origen.
- **Prioridad:** Alta.
- **Criterios de Aceptación:**
  1. Permite seleccionar un lote origen disponible (no bloqueado y con saldo).
  2. Permite elegir la etapa de proceso y registrar responsable, fecha y pesos.
  3. Vincula las entradas y salidas en la base de datos relacional.
- **Componentes:** `app/transformaciones/page.tsx`, `app/actions/transformaciones.ts`.

---

### HU-06: Consulta Pública de Trazabilidad por Código o QR (RF06)
- **Rol:** Como consumidor final o comprador internacional de cacao.
- **Necesidad:** Quiero consultar la historia completa de un lote mediante su código o escaneo de código QR.
- **Beneficio:** Para verificar el origen geográfico, productor y etapas de calidad garantizando la transparencia del producto.
- **Prioridad:** Alta (Requisito Fundamental RF06).
- **Criterios de Aceptación:**
  1. Permite buscar por código (`CAC001`, `CAC002`, etc.) sin requerir inicio de sesión.
  2. Muestra el productor, municipio de origen (Rivera, Campoalegre o Algeciras), fecha y línea de tiempo de procesos.
  3. **Seguridad y Privacidad:** NO revela costos internos, precios ni márgenes de utilidad de la asociación.
- **Componentes:** `app/trazabilidad/page.tsx`, `app/actions/trazabilidad.ts`.

---

### HU-07: Control de Mermas y Alerta Crítica >15% con Incidencia (RF04)
- **Rol:** Como responsable de control de calidad.
- **Necesidad:** Quiero que el sistema calcule automáticamente la merma del proceso y active una alerta visual crítica si supera el 15.0%.
- **Beneficio:** Para detectar a tiempo pérdidas anormales de masa y exigir el registro técnico de la causa.
- **Prioridad:** Alta (Requisito Fundamental RF04).
- **Criterios de Aceptación:**
  1. Aplica la fórmula: $\text{Merma (\%)} = ((Entrada - Salida) / Entrada) \times 100$.
  2. Si la merma es $\le 15.0\%$, muestra indicador verde de rango normal.
  3. Si la merma es $> 15.0\%$, despliega alerta roja obligatoria y bloquea el registro si no se detalla el campo `incidencia` ($\ge 5$ caracteres).
  4. Rechaza anomalías físicas cuando el peso de salida es superior al de entrada.
- **Componentes:** `lib/business-rules.ts`, `app/transformaciones/page.tsx`.

---

### HU-08: Costeo Unitario por Etapa y Margen Comercial Seguro (RF05 / RF12)
- **Rol:** Como administrador financiero de la asociación.
- **Necesidad:** Quiero conocer el costo unitario por kilogramo resultante de cada etapa y el margen comercial estimado sin riesgo de errores matemáticos.
- **Beneficio:** Para fijar precios justos y evaluar la rentabilidad del lote procesado.
- **Prioridad:** Alta (Requisitos RF05 y RF12).
- **Criterios de Aceptación:**
  1. Calcula el costo unitario: $\text{Costo Unitario} = \text{Costo Etapa} / \text{Salida Kg}$ (ej. $\$1.600.000 / 80\text{ kg} = \$20.000\text{ COP/kg}$).
  2. Calcula el margen comercial: $((Precio - Costo) / Precio) \times 100$ (ej. $\$25.000$ venta con costo $\$20.000 = 20.0\%$).
  3. Dispone de salvaguarda matemática contra división por cero retornando 0 de forma segura.
- **Componentes:** `lib/business-rules.ts`, `app/actions/transformaciones.ts`.

---

### HU-09: Balance de Inventario en Tiempo Real y Control de Sobreconsumo (RF08)
- **Rol:** Como jefe de bodega e inventario.
- **Necesidad:** Quiero que cada transformación descuente automáticamente los kilogramos del lote y bloquee cualquier intento de consumir más de lo disponible.
- **Beneficio:** Para evitar saldos negativos y descuadres físicos en los almacenes de acopio.
- **Prioridad:** Alta (Requisito Fundamental RF08).
- **Criterios de Aceptación:**
  1. El saldo disponible se calcula sumando recepciones y restando consumos en tiempo real.
  2. Si un operario intenta procesar 120 kg de un lote con 100 kg en existencia, el sistema rechaza la transacción con mensaje claro de error.
- **Componentes:** `lib/business-rules.ts`, `app/actions/transformaciones.ts`.

---

### HU-10: Idempotencia en Operaciones Concurrentes de Planta (RF08)
- **Rol:** Como arquitecto de software del sistema.
- **Necesidad:** Quiero que cada operación de transformación cuente con una clave de idempotencia generada en el cliente.
- **Beneficio:** Para que los reintentos causados por intermitencias de red en zonas rurales no dupliquen el consumo de inventario.
- **Prioridad:** Alta (Riesgo Crítico y Corrección 7 de PLAN_IA.md).
- **Criterios de Aceptación:**
  1. El formulario genera un identificador `idempotency_key` único al abrirse.
  2. Si el servidor recibe una petición con una clave ya procesada, devuelve el resultado exitoso previo sin crear un segundo movimiento de inventario.
- **Componentes:** `app/transformaciones/page.tsx`, `app/actions/transformaciones.ts`.

---

### HU-11: Bloqueo de Lotes por Alerta de Calidad (Incidente Hora 12 / RF09)
- **Rol:** Como Administrador de Calidad de la Asociación.
- **Necesidad:** Quiero una opción exclusiva de administrador para cambiar el estado de un lote a `bloqueado` o `liberado` registrando obligatoriamente el motivo.
- **Beneficio:** Para aislar de inmediato lotes con sospecha fitosanitaria (ej. humedad o fermentación defectuosa en la Hora 12) sin borrar el historial.
- **Prioridad:** Crítica (Escenario de Evaluación del Jurado a las 2:00 AM).
- **Criterios de Aceptación:**
  1. Usuarios con rol `operador` o sin autenticar son rechazados si intentan cambiar el estado.
  2. El Administrador puede cambiar el estado ingresando un motivo obligatorio ($\ge 5$ caracteres).
  3. Un lote bloqueado es inhabilitado para transformaciones y en la ficha pública muestra la alerta de bloqueo preventivo.
- **Componentes:** `app/lotes/page.tsx`, `app/actions/lotes.ts`.

---

### HU-12: Auditoría Inmutable de Modificaciones (RF10)
- **Rol:** Como auditor interno y evaluador del hackathon.
- **Necesidad:** Quiero que cada recepción, transformación y cambio de estado quede registrado con usuario, rol, fecha, valores anteriores y valores nuevos.
- **Beneficio:** Para garantizar el no repudio y cumplir con la trazabilidad forense exigida por la agroindustria.
- **Prioridad:** Alta (Requisito Fundamental RF10).
- **Criterios de Aceptación:**
  1. Registros persistidos en la tabla inmutable `auditoria_logs` en Supabase.
  2. Captura usuario de Clerk, rol, tabla afectada, acción y payload previo y posterior.
  3. No se permiten operaciones de `UPDATE` o `DELETE` sobre la tabla de auditoría.
- **Componentes:** `app/actions/lotes.ts`, `app/actions/transformaciones.ts`, `supabase/schema.sql`.
