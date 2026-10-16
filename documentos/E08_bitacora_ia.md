# Entregable E08 — Bitácora Consolidada de Uso de Inteligencia Artificial
**Hackathon USCO 2026:** Reto Agroindustria (Trazabilidad de Cacao)  
**Proyecto:** "Cacao con historia, calidad y valor" — Asociación Cacaotera del Huila (Rivera, Campoalegre y Algeciras)  
**Equipo de Desarrollo:**
- **Brayan (Lead Developer & Integrador):** Autenticación Clerk, Server Actions, Lógica de Negocio y Pruebas E2E.
- **Samuel (Frontend Developer):** Componentes visuales, interfaz React con Tailwind CSS y navegación.
- **El Verde (Backend Developer):** Arquitectura PostgreSQL en Supabase, DDL de tablas, semillas y contrato de datos desde Termux.

---

## 1. Declaración Ética y Cumplimiento del Reglamento

En conformidad con las bases oficiales del Hackathon USCO:
> *"Toda ayuda de la IA se declara (herramienta, modelo, propósito, componente generado, revisión humana y correcciones). El equipo debe entender y poder explicar todo el código generado."*

El equipo adoptó un enfoque de **desarrollo aumentado por IA**: los modelos actuaron como asistentes de programación guiados por instrucciones, arquitectura y criterios técnicos definidos por el equipo humano. Cada línea de código generada fue inspeccionada, probada y adaptada a las reglas agroindustriales del reto.

---

## 2. Modelos y Herramientas por Integrante

| Integrante | Rol | Herramienta Principal | Modelo de IA Utilizado | Entorno de Ejecución |
|---|---|---|---|---|
| **Samuel Bohórquez** | Frontend | Gemini (Google) | `Gemini 3.8 Flash` | PC / Cursor / VS Code |
| **El Verde (`ladrogaverde`)** | Backend & DB | Claude (Anthropic) | `Claude Sonnet` | Android (Termux) + Supabase Cloud |
| **Brayan (`BrayanRK`)** | Integrador & Lead | Asistente de Desarrollo | `Claude Opus 4.6 (Thinking)`<br>`Gemini 3.8 Flash (High)` | PC (Windows) + Node.js v24 |

---

## 3. Matriz Consolidada de Generación y Supervisión Humana

| Integrante | Componente Afectado | Propósito / Aporte de la IA | Supervisión y Corrección Humana |
|---|---|---|---|
| **Samuel** | `app/lotes/page.tsx`<br>`app/navbar.tsx` | Maquetación visual con Tailwind CSS, estructura de tablas y modales de captura. | **Samuel:** Diseño de paleta de colores Huila (verde esmeralda), creación autónoma del Navbar y validación de estados de React. |
| **El Verde** | `supabase/schema.sql`<br>`supabase/seed.sql`<br>`contrato.md` | Estructuración del esquema SQL relacional para lotes, transformaciones, inventario y vistas seguras. | **El Verde:** Ejecución manual en Supabase SQL Editor desde móvil, corrección de checks de masa ($> 0$), relaciones foráneas y llaves de acceso. |
| **Brayan** | `lib/supabase.ts`<br>`app/actions/lotes.ts`<br>`app/actions/transformaciones.ts` | Creación de Server Actions con balance de inventario dinámico, descuento de masas y registro en auditoría. | **Brayan:** Corrección del cálculo de saldo disponible (suma de recepciones menos consumos) y bloqueo de transformación si el lote está bloqueado (Hora 12). |
| **Brayan** | `lib/business-rules.ts`<br>`tests/business-rules.test.ts` | Lógica pura de cálculo de merma ($> 15\%$), costeo unitario ($20.000\text{ COP/kg}$), márgenes (20%) y 5 pruebas automatizadas (E05). | **Brayan:** Configuración de compatibilidad con el test runner nativo de Node.js v24 (`node:test`) sin necesidad de librerías externas pesadas. |
| **Equipo** | Integración Global | Resolución de colisiones de ramas entre frontend, backend y capa de autenticación. | **Brayan & Equipo:** Sincronización de ramas Git, ensamble del layout global y verificación funcional completa en `localhost:3000`. |

---

## 4. Bitácoras Detalladas por Desarrollador

Para consultar el registro cronológico paso a paso de cada integrante, remitirse a los archivos individuales:
- [Bitácora de Brayan (Integrador)](file:///c:/dev/cacao-trazabilidad/documentos/ia/brayan.md)
- [Bitácora de Samuel (Frontend)](file:///c:/dev/cacao-trazabilidad/documentos/ia/samuel.md)
- [Bitácora de El Verde (Backend)](file:///c:/dev/cacao-trazabilidad/documentos/ia/verde.md)

---

## 5. Preparación para la Defensa Técnica ante el Jurado

El equipo preparó y domina los 3 puntos neurálgicos que el jurado evaluará:
1. **Control Físico de Mermas (RF04):** Justificación técnica obligatoria si la merma supera el umbral del **15.0%** y detección de inconsistencias físicas ($Salida > Entrada$).
2. **Concurrencia e Inventario (RF08):** Prevención de doble consumo mediante claves de idempotencia (`idempotency_key`) y cálculo de saldos en tiempo real.
3. **Escenario de Contingencia (Hora 12 / RF09):** Aislamiento inmediato de lotes bloqueados (`CAC001`) con trazabilidad completa para el consumidor sin filtración de datos de costos de la asociación (RF06).
