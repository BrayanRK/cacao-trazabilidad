# Entregable E08 — Bitácora Oficial de Uso de Inteligencia Artificial
**Hackathon USCO 2026:** Reto Agroindustria (Trazabilidad de Cacao)  
**Asociación Cacaotera del Huila:** Rivera, Campoalegre y Algeciras  
**Equipo:** Brayan (Integrador / Lead Dev), Samuel (Frontend), Backend (Termux)  
**Declaración Ética:** Cumplimiento estricto del reglamento oficial de transparencia en IA.  

---

## 1. Política de Uso y Transparencia

De acuerdo con el reglamento oficial del evento:
> *"Toda ayuda de la IA se declara (herramienta, modelo, propósito, componente generado, revisión humana y correcciones). El equipo debe entender y poder explicar todo el código generado."*

El equipo utilizó herramientas de Inteligencia Artificial como **asistente de programación en pares (pair programming)** y acelerador de desarrollo. La arquitectura, toma de decisiones, requerimientos del cliente, lógica de negocio y supervisión de seguridad fueron conducidas 100% por el equipo humano.

---

## 2. Herramientas y Modelos Utilizados

| Herramienta / Plataforma | Modelos Utilizados | Rol y Propósito en el Proyecto |
|---|---|---|
| **Google Antigravity (AGY)** | `Claude Opus 4.6 (Thinking)`<br>`Gemini 3.8 Flash (High)` | Integración continua, arquitectura de Server Actions, diseño de pruebas automatizadas y soporte de compilación en Next.js 16. |
| **Cursor / VS Code AI** | Modelos LLM de autocompletado | Maquetación visual de componentes Tailwind en frontend. |

---

## 3. Matriz de Interacciones y Componentes Generados

| Sesión / Hito | Propósito | Prompt del Humano (Brayan) | Componente Generado por IA | Revisión Humana y Corrección Aplicada |
|:---:|---|---|---|---|
| **Hito 1 (Hora 2)** | Configuración de Autenticación con Roles | *"Configura Clerk en el layout y middleware para que tengamos roles de operador y admin"* | `app/layout.tsx`<br>`middleware.ts` | **Corrección humana:** En Clerk Core 3 (`@clerk/nextjs` v7.9), las etiquetas `<SignedIn>` cambiaron. Se ajustó el consumo a hooks `useUser()` nativos para evitar parpadeos de renderizado. |
| **Hito 2 (Hora 4)** | Conexión a Base de Datos en la Nube | *"Configura el cliente de Supabase y las Server Actions para consultar y recibir lotes con balance real"* | `lib/supabase.ts`<br>`app/actions/lotes.ts` | **Corrección humana:** Se detectó que el balance no debía ser una cifra fija, sino calculado dinámicamente sumando recepciones y restando consumos desde `inventario_movimientos` (RF08). |
| **Hito 3 (Hora 6)** | Pruebas Automatizadas Oficiales (E05) | *"Crea las 5 pruebas automatizadas que pide el entregable E05 para merma, costos, validación e inventario"* | `lib/business-rules.ts`<br>`tests/business-rules.test.ts` | **Corrección humana:** Para evitar instalar dependencias pesadas (Jest/Vitest), se utilizó el test runner nativo de Node.js v24 (`node:test`). Se ajustó `tsconfig.json` con `allowImportingTsExtensions: true` para compatibilidad limpia. |
| **Hito 4 (Hora 7)** | Módulo de Transformaciones Atómicas | *"Implementa la Server Action de transformaciones con cálculo de mermas, alertas >15% y descuento de stock"* | `app/actions/transformaciones.ts` | **Corrección humana:** Se agregó la validación estricta de que un lote con estado `"bloqueado"` no puede ser transformado, previniendo errores durante la simulación de la Hora 12. |
| **Hito 5 (Hora 8)** | Integración del Frontend del Equipo | *"Integra las pantallas de Samuel con nuestras Server Actions reales de Supabase"* | `app/navbar.tsx`<br>`app/lotes/page.tsx`<br>`app/transformaciones/page.tsx`<br>`app/trazabilidad/page.tsx` | **Corrección humana:** Se corrigió un error donde Samuel había sobreescrito accidentalmente `app/lotes/page.tsx` con el código del Navbar; se restauró la vista real y se conectó al modal con Server Actions. |

---

## 4. Guía de Defensa Técnica ante el Jurado (Para Brayan)

Durante la sustentación o el recorrido del jurado por el stand, se esperan preguntas sobre la implementación. A continuación se detallan los conceptos que el equipo domina:

### Pregunta 1: *"¿Cómo calculan la merma y cómo evitan falsos positivos en las alertas?"*
> **Respuesta:**  
> Usamos la fórmula oficial del sector cacaotero:  
> $$\text{Merma (\%)} = \left(\frac{\text{Peso Entrada} - \text{Peso Salida}}{\text{Peso Entrada}}\right) \times 100$$  
> Si el resultado es estrictamente mayor al **15.0%**, el sistema bloquea el guardado a menos que el operario registre una justificación técnica en el campo `incidencia`. Si la salida es mayor a la entrada, el sistema detecta una anomalía física y rechaza el registro.

### Pregunta 2: *"¿Cómo aseguran que dos operarios no consuman el mismo lote al mismo tiempo (doble consumo)?"*
> **Respuesta:**  
> En la base de datos registramos cada consumo en la tabla `inventario_movimientos`. Antes de autorizar la transformación, calculamos el saldo real disponible:
> $$\text{Saldo} = \sum \text{Recepciones} - \sum \text{Consumos}$$
> Además, implementamos **idempotencia** mediante `idempotency_key` única: si una petición se reenvía por problemas de red, la transacción reconoce la clave y no duplica el descuento de existencias.

### Pregunta 3: *"¿Qué pasa en la simulación de la Hora 12 si hay que bloquear el lote CAC001?"*
> **Respuesta:**  
> Solo un usuario con rol `admin` en Clerk puede cambiar el estado a `"bloqueado"` exigiendo un motivo técnico (mínimo 5 caracteres). Al bloquearse:
> 1. Queda registrado en la tabla inmutable `auditoria_logs`.
> 2. Se inhabilita automáticamente en el selector de transformaciones para impedir nuevos procesamientos.
> 3. En la ficha pública (`/trazabilidad`) aparece una alerta destacada en rojo informando el bloqueo, **sin revelar costos internos de la asociación** para cumplir con la privacidad del comprador (RF06).

---

## 5. Declaración de Dominio
El equipo certifica que comprende en su totalidad la arquitectura implementada, la estructura de base de datos en Supabase, las Server Actions de Next.js y el flujo de ejecución de las pruebas automatizadas.
