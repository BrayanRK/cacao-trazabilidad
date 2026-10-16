# Plataforma de Trazabilidad, Control de Mermas y Costos de Cacao — Huila

Sistema integral de trazabilidad agroindustrial desarrollado para la **Asociación de Productores de Cacao del Huila** (cobertura en Rivera, Campoalegre y Algeciras), en el marco de la **II Hackathon Agroindustria USCO 2026**.

---

## 1. Material Previo Declarado

El proyecto fue desarrollado desde cero durante las 24 horas del reto utilizando únicamente las siguientes librerías de código abierto y servicios estándar:
- **Framework Base:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack, licencia MIT) inicializado con `create-next-app`.
- **Estilos y Maquetación:** [Tailwind CSS v4](https://tailwindcss.com/) (licencia MIT).
- **Base de Datos & Almacenamiento:** [Supabase](https://supabase.com/) (PostgreSQL relacional, RPC y vistas seguras).
- **Gestión de Identidad & RBAC:** [Clerk Auth Core 3](https://clerk.com/) (Autenticación multi-rol: `operador` y `admin`).
- **Pruebas Automatizadas:** Test runner nativo de [Node.js (`node:test`)](https://nodejs.org/api/test.html) sin dependencias externas pesadas.

> [!NOTE]
> No se utilizó código propietario previo al evento. Todos los modelos de datos, reglas de negocio y componentes fueron construidos durante la hackathon.

---

## 2. Requisitos del Sistema e Instalación

### Requisitos Previos
- **Node.js:** Versión 20.x o superior (desarrollado y probado sobre Node.js v24.14.1 LTS).
- **NPM:** v10 o superior.
- **Git**

### Pasos de Instalación
```bash
# 1. Clonar el repositorio
git clone https://github.com/BrayanRK/cacao-trazabilidad.git
cd cacao-trazabilidad

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
```

### Variables de Entorno Requeridas (`.env.local`)
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXhhY3Qtc25haWwtNjg5OS5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_cSRd4JkRkM3Q6kLMcu9OPzKvAA4cEyNN8GGFCShPoL

# Supabase (PostgreSQL)
NEXT_PUBLIC_SUPABASE_URL=https://ttvviyzfwxsqwztchbjj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_aMWiwj-oj7UTMnbSEBtBKg_1DIXqIIz
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0dnZpeXpmd3hzcXd6dGNoYmpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjEwMjk4OCwiZXhwIjoyMTA3Njc4OTg4fQ.8bHX4tKfH_npMy2MYeFN672GlUq-IRTjh6xg27FIJ0A
```

---

## 3. Ejecución del Proyecto

### Modo Desarrollo
```bash
npm run dev
```
La aplicación estará disponible localmente en:
- **Computador (Escritorio):** [http://localhost:3000](http://localhost:3000)
- **Dispositivos Móviles (Red Local Wi-Fi):** `http://<IP_LOCAL>:3000` (barra de navegación inferior fija `BottomNav` y tarjetas táctiles optimizadas).

### Compilación y Modo Producción
```bash
npm run build
npm start
```

---

## 4. Ejecución de Pruebas Automatizadas (Entregable E05)

La suite de pruebas automatizadas valida la lógica de negocio pura de manera desacoplada y nativa:
```bash
npm test
```

### Resultados de Ejecución:
- **6/6 pruebas aprobadas (100% de éxito)** en aproximadamente 15 milisegundos:
  1. `RF04`: Cálculo exacto de merma física y activación de alertas si supera el 15.0%.
  2. `RF05 & RF12`: Costeo unitario acumulado y margen comercial con salvaguarda de división por cero.
  3. `RF01`: Rechazo estricto de cantidades negativas, cero y campos obligatorios de recepción.
  4. `RF08`: Balance de inventario dinámico, prevención de sobreconsumo e idempotencia de transacciones.
  5. `RF09`: Bloqueo de operadores no autorizados en transiciones de calidad y validación de motivo obligatorio.

---

## 5. Usuarios de Demostración y Roles (RBAC)

El sistema implementa control de acceso basado en roles con Clerk:

| Rol | Correo / Identificador | Contraseña / Acceso | Permisos y Alcance |
|---|---|---|---|
| **Administrador** | `brayangasca37@gmail.com` | Código OTP / Sesión Clerk | Acceso total: Recepción (RF01), Transformaciones (RF03/RF04), Costeo completo (RF05/RF12) y **Cambio de Estado de Lotes (RF09)** con justificación técnica obligatoria. |
| **Operador** | `operador@cacao.com` (o nuevo registro) | Registro directo con correo | Registro de recepciones, ejecución de transformaciones y visualización operativa de balances sin permisos de bloqueo/liberación. |
| **Público / Comprador** | Acceso anónimo libre | Sin inicio de sesión | Acceso por QR a [`/trazabilidad`](http://localhost:3000/trazabilidad) con **privacidad comercial garantizada (RF06)**: no revela costos internos ni márgenes comerciales. |

---

## 6. Datos Sintéticos de Demostración (Seed Oficial)

La base de datos en Supabase cuenta con los siguientes lotes cargados y listos para pruebas del jurado:

| ID Lote | Productor | Municipio (Huila) | Masa Inicial | Saldo Disponible | Estado | Justificación / Incidencia |
|---|---|---|:---:|:---:|:---:|---|
| **`CAC001`** | Carlos Dussán | Rivera | 500 kg | 400 kg | `liberado` | Consumió 100 kg en Fermentación con merma del 10%. Apto para procesamiento. |
| **`CAC002`** | Ana María Trujillo | Campoalegre | 400 kg | 400 kg | `liberado` | Lote estándar en acopio inicial listo para fermentación o secado. |
| **`CAC003`** | Jorge Eliécer Perdomo | Algeciras | 350 kg | 350 kg | `bloqueado` | **Simulación Hora 12 (RF09):** Bloqueado por muestreo preventivo de cadmio/humedad. El sistema rechaza cualquier intento de transformación. |

---

## 7. Documentación Oficial y Entregables del Hackathon

Todos los entregables exigidos por la rúbrica oficial se encuentran en la carpeta `documentos/`:
- [**`ENTREGA.md`**](file:///c:/dev/cacao-trazabilidad/ENTREGA.md): Carátula oficial de entrega y Matriz de Trazabilidad (RF01–RF12).
- [**`E02_historias_usuario.md`**](file:///c:/dev/cacao-trazabilidad/documentos/E02_historias_usuario.md): 12 Historias de Usuario completas con criterios de aceptación Gherkin y prioridades MoSCoW.
- [**`E05_pruebas.md`**](file:///c:/dev/cacao-trazabilidad/documentos/E05_pruebas.md): Matriz de 15 pruebas funcionales ejecutadas y reporte de pruebas automatizadas.
- [**`E08_bitacora_ia.md`**](file:///c:/dev/cacao-trazabilidad/documentos/E08_bitacora_ia.md): Bitácora consolidada de uso de Inteligencia Artificial y supervisión humana.
  - [Bitácora de Brayan (Lead Dev)](file:///c:/dev/cacao-trazabilidad/documentos/ia/brayan.md)
  - [Bitácora de Samuel (Frontend)](file:///c:/dev/cacao-trazabilidad/documentos/ia/samuel.md)
  - [Bitácora de El Verde (Backend)](file:///c:/dev/cacao-trazabilidad/documentos/ia/verde.md)
