# Bitácora de Desarrollo y Uso de IA — Samuel Chantre
**Usuario GitHub:** [`samuelchantre`](https://github.com/samuelchantre)  
**Rol:** Frontend Developer  
**Proyecto:** Cacao Trazabilidad — Huila (Rivera, Campoalegre, Algeciras)  
**Herramienta IA:** Gemini (Modelo: Gemini 3.8 Flash) y Desarrollo Autónomo  

---

## 1. Historias de Usuario Desarrolladas (Frontend)

| ID | Historia de Usuario | Descripción / Criterios de Aceptación | Componentes / Rutas |
|---|---|---|---|
| **HU-01** | Navegación Global y Autenticación | Como usuario del sistema, quiero una barra de navegación fija e intuitiva con el logo de la región (Huila), acceso directo a todos los módulos y mi perfil de Clerk, para desplazarme fácilmente. | `app/navbar.tsx`<br>`app/layout.tsx` |
| **HU-02** | Protección de Rutas (Middleware) | Como administrador, quiero que las vistas privadas (`/lotes`, `/transformaciones`) requieran inicio de sesión y la consulta pública (`/trazabilidad`) sea accesible sin autenticación. | `middleware.ts` |
| **HU-03** | Panel de Control (Dashboard Principal) | Como usuario, quiero una vista principal visualmente atractiva donde pueda entender la propuesta del cacao del Huila y acceder directamente al Gestor de Lotes. | `app/page.tsx` |
| **HU-04** | Gestor de Lotes (Recepción de Materia Prima) | Como operario de acopio, quiero una interfaz interactiva donde pueda visualizar y registrar lotes con sus pesos, orígenes (Rivera, Campoalegre, Algeciras) y estados de calidad (Liberado, Pendiente, Bloqueado). | `app/lotes/page.tsx` |
| **HU-05** | Módulo de Transformaciones Post-Cosecha | Como supervisor de planta, quiero una interfaz limpia para controlar las etapas (Fermentación, Secado, Trillado, Tostado) y registrar el balance de masas/mermas. | `app/transformaciones/page.tsx` |
| **HU-06** | Consulta Pública de Trazabilidad | Como consumidor o comprador final, quiero consultar el historial de origen y transformación de un lote mediante una línea de tiempo interactiva. | `app/trazabilidad/page.tsx` |

---

## 2. Bitácora de Uso de Inteligencia Artificial y Contribución Humana

| Fecha / Hora | Autor / Herramienta | Componente | Propósito / Generación | Autoría / Revisión Humana |
|---|---|---|---|---|
| 15/10/2026 - 6:30 PM | Gemini (Gemini 3.8 Flash) | `app/lotes/page.tsx` | Generación inicial de la estructura visual de la tabla de lotes con Tailwind CSS y datos sintéticos. | Revisión y ajuste completo de componentes por el desarrollador (Samuel Bohórquez). |
| 15/10/2026 - 6:45 PM | Gemini (Gemini 3.8 Flash) | `app/lotes/page.tsx` | Sugerencia de lógica de filtrado con React (`useState`). | Implementación, depuración y validación manual de los filtros por Samuel Bohórquez. |
| 15/10/2026 - 7:00 PM | Gemini (Gemini 3.8 Flash) | `app/lotes/page.tsx` | Estructura base de la ventana modal y formulario de recepción. | Diseño definitivo de flujos y control de estados a cargo de Samuel Bohórquez. |
| 15/10/2026 - 7:26 PM | Samuel Bohórquez (Desarrollador) | `app/navbar.tsx`<br>`app/layout.tsx` | Desarrollo autónomo total del componente de navegación principal (Navbar) y su integración en el Layout raíz. | Autoría propia del desarrollador sin asistencia de IA. |
| 15/10/2026 - 7:41 PM | Samuel Bohórquez (Desarrollador) | Git / Autenticación | Creación autónoma de la rama de trabajo y configuración inicial del módulo de seguridad con Clerk. | Autoría propia del desarrollador sin asistencia de IA. |
| 15/10/2026 - 8:15 PM | Gemini (Gemini 3.8 Flash) | `.env.local`<br>`middleware.ts` | Guía de configuración de variables de entorno y reglas del middleware. | Prueba y solución final de integración implementada directamente por Samuel Bohórquez. |
