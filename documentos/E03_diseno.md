# Entregable E03 — Documento de Diseño de Arquitectura y Datos

**Proyecto:** Plataforma de Trazabilidad, Control de Mermas y Costos de Cacao — Huila  
**Equipo:** Equipo 3 (Cacao Trazabilidad Huila)  
**Fecha:** 16 de Octubre de 2026 — II Hackathon Agroindustria USCO  

---

## 1. Arquitectura General del Sistema

El sistema implementa una arquitectura moderna de **3 capas desacopladas**, priorizando la integridad de datos transaccionales y la seguridad en la nube:

```mermaid
flowchart TD
    subgraph Cliente["1. Capa de Presentación (Responsive & Móvil)"]
        A["Celular Android / PC Browser"]
        B["BottomNav + Tarjetas Táctiles (Tailwind CSS v4)"]
        C["PWA / Vista QR Pública (/trazabilidad)"]
    end

    subgraph Logica["2. Capa de Aplicación & Lógica de Negocio (Next.js 16)"]
        D["Next.js App Router (Turbopack)"]
        E["Clerk Auth Core 3 (RBAC: Admin / Operador)"]
        F["Server Actions (Transaccionales)"]
        G["Módulo Puro de Negocio (business-rules.ts)"]
    end

    subgraph Datos["3. Capa de Persistencia & Auditoría (Supabase / PostgreSQL)"]
        H[("PostgreSQL 15 Relacional")]
        I["Tablas con Checks de Integridad Física"]
        J["Triggers de Auditoría Inmutable (auditoria_logs)"]
        K["Vistas Seguras (vista_ficha_publica sin costos)"]
    end

    A --> B
    B --> D
    C --> D
    D --> E
    D --> F
    F --> G
    F --> H
    H --> I
    I --> J
    H --> K
```

---

## 2. Diagrama de Flujo de Trazabilidad y Calidad

El ciclo de vida del cacao desde la cosecha hasta la venta cumple con las reglas RF01 a RF12:

```mermaid
flowchart LR
    R["1. Recepción en Acopio (RF01/RF02)"] -->|"Lote CAC00X (Pendiente/Liberado)"| F["2. Fermentación (RF03)"]
    F -->|"Consumo de masa & Merma"| M{"3. Control Merma (RF04)"}
    M -->|"≤ 15.0%"| S["4. Secado Solar"]
    M -->|"> 15.0%"| J["Alerta Crítica: Justificación Obligatoria"]
    J --> S
    S --> C{"5. Control Calidad (RF09)"}
    C -->|"Apto"| L["Estado: Liberado (RF12: Venta +20% margen)"]
    C -->|"Cadmio / Humedad (Hora 12)"| B["Estado: Bloqueado (Aislado de Transformación)"]
    L --> Q["6. Ficha Pública por Código QR (RF06: Sin Costos)"]
    B --> Q
```

---

## 3. Modelo de Datos Relacional (ERD)

Diseñado en PostgreSQL con restricciones de integridad referencial, checks de masa positiva y balance dinámico:

```mermaid
erDiagram
    LOTES ||--o{ TRANSFORMACION_ENTRADAS : "es consumido en"
    LOTES ||--o{ INVENTARIO_MOVIMIENTOS : "registra balances"
    LOTES ||--o{ AUDITORIA_LOGS : "genera auditoria"
    TRANSFORMACIONES ||--|{ TRANSFORMACION_ENTRADAS : "consume"
    TRANSFORMACIONES ||--|{ TRANSFORMACION_SALIDAS : "produce"
    TRANSFORMACIONES ||--o{ INVENTARIO_MOVIMIENTOS : "afecta inventario"

    LOTES {
        string id PK "CAC001, CAC002, CAC003"
        string productor "Nombre agricultor"
        string origen "Rivera, Campoalegre, Algeciras"
        numeric cantidad_inicial "Estrictamente > 0 kg"
        string unidad "kg"
        string estado "pendiente, liberado, bloqueado"
        string motivo_estado "Obligatorio en bloqueos"
        timestamp fecha_recepcion
        timestamp created_at
    }

    TRANSFORMACIONES {
        uuid id PK
        string etapa "Fermentación, Secado"
        timestamp fecha
        numeric peso_entrada "Masa consumida kg"
        numeric peso_salida "Masa obtenida kg"
        numeric merma_pct "Porcentaje calculado"
        boolean alerta_merma "True si > 15%"
        string justificacion_incidencia "Requerido si alerta"
        numeric costo_etapa "Costos operativos COP"
        string idempotency_key UK "Previene doble consumo"
    }

    TRANSFORMACION_ENTRADAS {
        uuid id PK
        uuid transformacion_id FK
        string lote_id FK
        numeric cantidad_consumida
    }

    TRANSFORMACION_SALIDAS {
        uuid id PK
        uuid transformacion_id FK
        string lote_id FK
        numeric cantidad_obtenida
    }

    INVENTARIO_MOVIMIENTOS {
        uuid id PK
        string lote_id FK
        string tipo "recepcion, consumo, ajuste"
        numeric cantidad
        timestamp fecha
    }

    AUDITORIA_LOGS {
        uuid id PK
        string tabla "lotes, transformaciones"
        string operacion "INSERT, UPDATE, DELETE"
        string usuario "correo operador o admin"
        jsonb detalle_anterior
        jsonb detalle_nuevo
        timestamp fecha
    }
```

---

## 4. Estrategia de Seguridad y Confidencialidad (RF06 y RF07)

1. **Aislamiento de Costos (RF06):** La vista `vista_ficha_publica` y el Server Action `getFichaPublicaAction` seleccionan explícitamente solo atributos agrícolas y de proceso, omitiendo cualquier campo financiero (`costo_compra_kg`, `costo_etapa`, `costo_acumulado`).
2. **Defensa en Profundidad (RBAC):** La autorización no depende únicamente del cliente; los Server Actions ejecutan validación estricta con `currentUser()` y verifican el claim `role === 'admin'` antes de invocar `cambiarEstadoLoteAction`.
