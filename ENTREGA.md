# Documento Oficial de Entrega — II Hackathon Agroindustria USCO 2026

- **Reto Seleccionado:** Reto Agroindustria — Trazabilidad, Control de Mermas y Costeo de Cacao del Huila
- **Equipo:** Equipo 3 (Cacao Trazabilidad Huila)
- **Integrantes:**
  - **Brayan Gasca** — Usuario GitHub: [`BrayanRK`](https://github.com/BrayanRK) (Integrador & Lead Developer)
  - **Samuel Chantre** — Usuario GitHub: [`samuelchantre`](https://github.com/samuelchantre) (Frontend Developer)
  - **El Verde** — Usuario GitHub: [`ladrogaverde`](https://github.com/ladrogaverde) (Backend & Database Architect)
- **Repositorio Central:** [https://github.com/BrayanRK/cacao-trazabilidad](https://github.com/BrayanRK/cacao-trazabilidad)
- **Rama de Entrega:** `feature/ui-base` (y sincronizada en `main`)

---

## 1. Índice de Entregables Oficiales

| Código | Entregable Oficial | Ubicación en el Repositorio | Descripción / Estado |
|---|---|---|---|
| **E01** | Comprensión del Problema | [`documentos/E01_problema.md`](file:///c:/dev/cacao-trazabilidad/documentos/E01_problema.md) | Análisis de productores en Rivera, Campoalegre y Algeciras, restricciones de calidad y mermas. |
| **E02** | Requisitos y Planificación | [`documentos/E02_historias_usuario.md`](file:///c:/dev/cacao-trazabilidad/documentos/E02_historias_usuario.md) | **12 Historias de Usuario completas** con priorización MoSCoW, tareas y criterios Gherkin. |
| **E03** | Diseño del Sistema | [`documentos/E03_diseno.md`](file:///c:/dev/cacao-trazabilidad/documentos/E03_diseno.md) | Arquitectura Next.js + Supabase + Clerk, modelo entidad-relación y flujo de trazabilidad. |
| **E04** | Código Fuente y Construcción | Repositorio raíz (`app/`, `lib/`, `components/`) | Código completo en Next.js 16 con Server Actions, PostgreSQL y control de versiones con prefijos `[IA]`. |
| **E05** | Pruebas del Sistema | [`documentos/E05_pruebas.md`](file:///c:/dev/cacao-trazabilidad/documentos/E05_pruebas.md) & `tests/` | **15 Casos de Prueba Manuales (CP01–CP15)** + Suite nativa de **6 pruebas automatizadas (`npm test`)** pasando al 100%. |
| **E06** | Usabilidad e Interfaz Móvil | [`components/BottomNav.tsx`](file:///c:/dev/cacao-trazabilidad/components/BottomNav.tsx) & vistas responsivas | Barra de navegación inferior móvil (`BottomNav`), tarjetas táctiles y compatibilidad móvil comprobada en Android. |
| **E07** | Mantenimiento y Operación | [`documentos/E07_mantenimiento.md`](file:///c:/dev/cacao-trazabilidad/documentos/E07_mantenimiento.md) | Correcciones de compatibilidad CORS en red local, salvaguarda de concurrencia e idempotencia. |
| **E08** | Bitácora de Inteligencia Artificial | [`documentos/E08_bitacora_ia.md`](file:///c:/dev/cacao-trazabilidad/documentos/E08_bitacora_ia.md) | **Bitácora consolidada y 3 bitácoras individuales** (`ia/brayan.md`, `ia/samuel.md`, `ia/verde.md`) con prompts, modelos y supervisión humana. |
| **E09** | Comercialización y Piloto | [`documentos/E09_comercializacion.md`](file:///c:/dev/cacao-trazabilidad/documentos/E09_comercializacion.md) | Propuesta de despliegue piloto para la asociación de productores con costeo por kilogramo trazado. |

---

## 2. Matriz de Trazabilidad de Requisitos Funcionales (RF01 – RF12)

| Requisito Funcional | Componente de Software | Caso de Prueba | Resultado | Evidencia / Justificación Técnica |
|---|---|---|:---:|---|
| **RF01: Recepción de Lotes** | `app/actions/lotes.ts`<br>`app/lotes/page.tsx` | CP01 & Test Auto 3 | **APROBADO** | Valida que la cantidad inicial sea estrictamente $> 0$, asigna ID secuencial único (`CAC00X`) y registra al productor y fecha. |
| **RF02: Clasificación de Origen** | `app/lotes/page.tsx`<br>`app/trazabilidad/page.tsx` | CP02 | **APROBADO** | Filtra y visualiza el origen municipal obligatorio (Rivera, Campoalegre, Algeciras) en tarjetas y tablas. |
| **RF03: Registro de Transformaciones** | `app/actions/transformaciones.ts`<br>`app/transformaciones/page.tsx` | CP03 & Test Auto 4 | **APROBADO** | Permite registrar etapas sucesivas (Fermentación, Secado) descontando del inventario real del lote origen. |
| **RF04: Monitoreo de Mermas (>15%)** | `lib/business-rules.ts`<br>`app/transformaciones/page.tsx` | CP04 & Test Auto 1 | **APROBADO** | Calcula la merma física en tiempo real $[(E - S)/E \times 100]$. Si supera el 15.0%, exige justificación técnica obligatoria. |
| **RF05: Costeo Unitario por Etapa** | `lib/business-rules.ts`<br>`app/actions/transformaciones.ts` | CP05 & Test Auto 2 | **APROBADO** | Acumula el costo de compra ($20.000\text{ COP/kg}$) y costos operativos por etapa; evita división por cero ante masas nulas. |
| **RF06: Ficha Pública Segura (QR)** | `app/actions/trazabilidad.ts`<br>`app/trazabilidad/page.tsx` | CP06 | **APROBADO** | Acceso público sin login para el consumidor; muestra productor, fechas y mermas **sin exponer costos ni márgenes internos**. |
| **RF07: Control de Acceso RBAC** | `middleware.ts`<br>`app/navbar.tsx` | CP07 & Test Auto 5 | **APROBADO** | Autenticación multi-rol con Clerk: `operador` registra datos cotidianos; solo `admin` puede alterar estados de calidad. |
| **RF08: Balance de Inventario Dinámico** | `app/actions/lotes.ts`<br>`inventario_movimientos` | CP08 & Test Auto 4 | **APROBADO** | Saldo disponible calculado por sumatoria transaccional; rechaza consumos que excedan el saldo actual disponible. |
| **RF09: Bloqueo Preventivo (Hora 12)** | `app/actions/lotes.ts`<br>`app/transformaciones/page.tsx` | CP09 & Test Auto 5 | **APROBADO** | Permite al Administrador bloquear lotes (`CAC003` / `CAC001`) con motivo obligatorio. Los lotes bloqueados no pueden procesarse. |
| **RF10: Auditoría Inmutable** | `supabase/schema.sql`<br>`auditoria_logs` | CP10 | **APROBADO** | Registro persistente con usuario, fecha, acción y detalle de cambios críticos en la base de datos PostgreSQL. |
| **RF11: Interfaz Móvil Responsiva** | `components/BottomNav.tsx`<br>`app/layout.tsx` | CP11 | **APROBADO** | Barra fija inferior para celular, botones táctiles $\ge 48\text{px}$ y tablas que se adaptan a tarjetas independientes en Android. |
| **RF12: Margen Comercial Sugerido** | `lib/business-rules.ts`<br>`app/actions/transformaciones.ts` | CP12 & Test Auto 2 | **APROBADO** | Calcula el margen comercial del 20% sobre el costo unitario acumulado para sugerir el precio de venta competitivo. |
