# Entregable E01 — Ficha de Caracterización del Problema

**Reto Oficial:** Agroindustria — Trazabilidad, Control de Mermas y Costeo de Cacao del Huila  
**Equipo Evaluado:** Equipo 3 (Cacao Trazabilidad Huila)  
**Fecha:** 16 de Octubre de 2026 — II Hackathon Agroindustria USCO  

---

## 1. Identificación y Contexto Territorial del Problema

El departamento del Huila se consolida como uno de los principales productores de cacao fino de aroma en Colombia, concentrando una producción estratégica en los municipios de **Rivera, Campoalegre y Algeciras**. No obstante, las asociaciones de pequeños y medianos productores enfrentan brechas críticas de competitividad:

1. **Pérdida de Valor por Falta de Trazabilidad:** Los lotes de cacao fino se mezclan durante el acopio y fermentación comunitaria, perdiendo la identidad de origen municipal y diluyendo primas de precio internacional (hasta un 25% extra por origen certificado).
2. **Opacidad en Mermas Físicas:** El proceso post-cosecha (fermentación en cajones de madera y secado solar) genera variaciones de masa entre el 10% y el 15%. Mermas superiores al **15.0%** indican fermentación deficiente, deshidratación acelerada o mermas ficticias no auditadas.
3. **Inexactitud en el Costeo Real por Kilogramo:** Las cooperativas liquidan a precio fijo promedio sin imputar los costos operativos de fermentación ($COP) sobre los kilogramos reales finales salientes, distorsionando los márgenes de venta.
4. **Vulnerabilidad ante Alertas Sanitarias (Cadmio y Humedad):** Ante la detección de contaminantes o excesos de humedad, la falta de trazabilidad obliga a descartar o desvalorizar acopios enteros por no poder aislar quirúrgicamente el lote contaminado.

---

## 2. Mapa de Usuarios y Actores del Ecosistema

| Actor | Perfil y Rol | Necesidad Central | Dolores Actuales |
|---|---|---|---|
| **Productor Rural** | Pequeño cacaotero de Rivera, Campoalegre o Algeciras. | Certificación de entrega y pago justo según masa y calidad de su cosecha. | Mezcla indiscriminada de su grano con lotes de menor calidad sin reconocimiento económico. |
| **Operador de Planta** | Encargado de recepción, pesaje, cajones de fermentación y secado. | Registro ágil en campo (celular/tablet) de masas de entrada, salida y consumos. | Registros manuales en papel propensos a pérdida, doble digitación o cálculos erróneos de merma. |
| **Administrador / Calidad** | Gerente de la asociación y director técnico de calidad. | Monitoreo en tiempo real de inventarios, costeo acumulado y poder de bloqueo preventivo ante incidencias. | Respuestas lentas (> 24 h) ante detecciones de cadmio o contaminación; pérdida de margen financiero. |
| **Comprador / Consumidor** | Industria chocolatera especial o consumidor final con lector QR. | Verificación transparente del origen Huila, productor y condiciones del proceso. | Desconfianza sobre el origen real del cacao y adulteraciones en la cadena de suministro. |

---

## 3. Restricciones Técnicas y de Negocio

- **Masa Física Estricta (RF01):** Toda recepción de lote debe tener cantidad inicial estrictamente mayor a $0\text{ kg}$.
- **Umbral de Alerta de Merma (RF04):** Toda pérdida de masa física que supere el **15.0%** debe disparar una alerta crítica y exigir justificación técnica obligatoria del operario.
- **Conservación de Masa e Idempotencia (RF08):** Un lote no puede consumir más masa de la que tiene disponible en inventario. Las transacciones deben prevenir doble consumo accidental.
- **Confidencialidad Comercial (RF06):** La consulta pública para consumidores por código o QR debe certificar origen y etapas post-cosecha **sin exponer jamás** los costos internos ni márgenes financieros de la cooperativa.
- **Gobernanza de Calidad (RF09):** Solo el rol `admin` puede cambiar el estado de un lote (`pendiente`, `liberado`, `bloqueado`) justificando el motivo técnico de forma inmutable.

---

## 4. Beneficio Esperado y Retorno de Inversión

- **Incremento de Ingresos por Prima de Origen:** Captura de un margen comercial superior al **20%** al certificar origen Rivera, Campoalegre y Algeciras.
- **Reducción de Mermas Injustificadas:** Disminución estimada del 4% en pérdidas de masa gracias a la auditoría técnica obligatoria en tiempo real.
- **Respuesta Sanitaria Inmediata:** Capacidad de aislar lotes bloqueados (`CAC003` / `CAC001`) en menos de 10 segundos protegiendo el resto del inventario exportable.
