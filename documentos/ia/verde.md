# Bitácora de Desarrollo y Uso de IA — David Laverde (Backend / DB)
**Usuario GitHub:** [`ladrogaverde`](https://github.com/ladrogaverde)  
**Rol:** Backend Developer & Database Architect  
**Entorno de Trabajo:** Termux (Android) + Supabase Cloud  
**Herramienta IA:** Claude (Modelo: Claude Sonnet) y Desarrollo Autónomo  

---

## 1. Responsabilidades y Alcance en el Proyecto

- **Definición de Arquitectura de Datos:** Supabase (PostgreSQL) con reglas de negocio aplicadas en la capa de persistencia (inventario, permisos y estados).
- **Flujo Git en Móvil (Termux):** Configuración de SSH / Personal Access Token en entorno Linux móvil para colaborar en el repositorio `BrayanRK/cacao-trazabilidad` en la rama `feature/backend-db`.
- **Esquema Relacional DDL:** Creación de tablas de lotes, transformaciones, inventario, auditoría y vistas de seguridad.
- **Contrato de Integración:** Documentación formal de tablas, vistas, funciones RPC y mensajes de error para consumo de frontend e integrador.

---

## 2. Bitácora de Uso de Inteligencia Artificial y Contribución Humana

| Fecha / Hora | Herramienta y Modelo | Componente / Archivo | Propósito / Generación | Revisión Humana y Ajustes en Termux |
|---|---|---|---|---|
| 15/10/2026 - 5:00 PM | Claude Sonnet | Planificación de BD | Análisis del caso de estudio de agroindustria (Huila) y estructuración del stack Supabase + PostgreSQL. | El Verde: Validación de compatibilidad para ejecutar desde Termux y navegador móvil. |
| 15/10/2026 - 7:30 PM | Claude Sonnet | Entorno Git / Termux | Asistencia en solución de errores de autenticación con Personal Access Token y comandos Git en CLI móvil. | El Verde: Creación de rama `feature/backend-db` y configuración de credenciales. |
| 15/10/2026 - 9:28 PM | Claude Sonnet | `supabase/schema.sql` | Estructuración del DDL de tablas: `lotes`, `transformaciones`, `transformacion_entradas`, `transformacion_salidas`, `inventario_movimientos`, `auditoria_logs`. | El Verde: Verificación de llaves foráneas, checks de cantidad $>0$, y estados (`pendiente`, `liberado`, `bloqueado`). |
| 15/10/2026 - 9:58 PM | Claude Sonnet | `supabase/seed.sql`<br>`documentos/contrato.md` | Generación de semillas iniciales (`CAC001`, `CAC002`, `CAC003` para 330 kg) y redacción del contrato de integración frontend-backend. | El Verde: Ejecución y verificación de datos en el Dashboard SQL de Supabase; commit y push a GitHub. |
| 15/10/2026 - 11:35 PM | Desarrollo Autónomo | Seguridad de API Keys | Definición de políticas de llaves: compartir URL y Anon Key; resguardar Service Role Key en servidor. | El Verde: Auditoría manual de credenciales antes del hito de la Hora 12. |
