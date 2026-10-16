const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} = require("docx");

async function generate() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // TITULO PRINCIPAL
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "II HACKATHON AGROINDUSTRIA USCO 2026",
                bold: true,
                size: 28,
                color: "064E3B", // emerald
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "CACAO TRAZABILIDAD HUILA — SISTEMA DIGITAL INTEGRAL",
                bold: true,
                size: 36,
                color: "0F172A",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Trazabilidad, Control de Mermas (>15%), Costeo Unitario y Certificación QR",
                italics: true,
                size: 22,
                color: "475569",
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // INFORMACIÓN GENERAL
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: "1. INFORMACIÓN DEL EQUIPO Y REPOSITORIO",
                bold: true,
                color: "047857",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Nombre del Equipo: ", bold: true }),
              new TextRun({ text: "syntax_error (Equipo 3 - Reto Cacao Huila)" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Integrantes Oficiales:\n", bold: true }),
              new TextRun({ text: "   - Brayan Gasca (Lead Developer & Integrador de Arquitectura)\n" }),
              new TextRun({ text: "   - Samuel Chantre (Frontend Developer & Experiencia Móvil)\n" }),
              new TextRun({ text: "   - David Laverde (Backend Developer & Arquitecto de Base de Datos)\n" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Municipios de Impacto: ", bold: true }),
              new TextRun({ text: "Rivera, Campoalegre y Algeciras (Huila)" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Repositorio Central Oficial: ", bold: true }),
              new TextRun({ text: "https://github.com/BrayanRK/cacao-trazabilidad" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Stack Tecnológico: ", bold: true }),
              new TextRun({ text: "Next.js 16 (App Router), Supabase (PostgreSQL), Clerk (RBAC) y Tailwind CSS v4." }),
            ],
          }),
          new Paragraph({ text: "" }),

          // GUION DE EXPOSICION
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: "2. GUION OFICIAL DEL PITCH (5 MINUTOS EXACTOS)",
                bold: true,
                color: "047857",
              }),
            ],
          }),

          // MINUTO 1
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            children: [new TextRun({ text: "⏱️ MINUTO 1 (0:00 - 1:00) — ¿Qué hace el software?", bold: true })],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "👤 Habla: ", bold: true }),
              new TextRun({ text: "Samuel Chantre (Frontend Developer)" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "🖥️ En Pantalla: ", bold: true }),
              new TextRun({ text: "Diapositiva 1 (Portada de syntax_error) en http://localhost:3000/presentacion.html" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '“Buenos días, jurados y evaluadores. Somos el equipo syntax_error (Samuel Chantre, David Laverde y Brayan Gasca).\n\nNuestro software se llama Cacao Trazabilidad Huila: es una plataforma web moderna, segura y 100% responsiva (Mobile-First), diseñada para operar tanto en computadores de oficina como en los celulares de los operarios en los centros de acopio.\n\n¿Qué hace exactamente el software?\nDigitaliza y custodia todo el viaje del cacao huilense desde que el campesino entrega el grano fresco en baba hasta el comprador final. Registra la entrada de materia prima con identificadores únicos por lote, supervisa en tiempo real las pérdidas de peso en fermentación y secado, calcula el costo unitario de producción por kilogramo y genera un certificado digital con código QR para que cualquier persona en el mundo verifique su origen y calidad.\n\nY para entender el dolor real que esto resuelve en el Huila y ver el software funcionando en vivo, los dejo con mi compañero Brayan Gasca.”',
                italics: true,
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // MINUTO 2
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            children: [new TextRun({ text: "⏱️ MINUTO 2 (1:00 - 2:00) — El Dolor del Huila y la Solución", bold: true })],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "👤 Habla: ", bold: true }),
              new TextRun({ text: "Brayan Gasca (Lead Developer)" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "🖥️ En Pantalla: ", bold: true }),
              new TextRun({ text: "Diapositiva 2 (El Dolor de la Post-Cosecha)" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '“Muchas gracias, Samuel. ¿Por qué esto resuelve el dolor real del Huila?\n\nNuestro departamento, especialmente municipios como Rivera, Campoalegre y Algeciras, produce cacao fino de aroma de talla mundial. Sin embargo, los centros de acopio campesinos siguen operando en cuadernos y libretas de papel. Esto genera tres problemas graves:\n1. Pérdidas a ciegas: El grano pierde peso en fermentación y secado sin control; nadie sabe si fue por calor, hongos o descuido.\n2. Ventas a pérdida: Las asociaciones no saben cuánto les cuesta procesar un kilo de cacao seco y venden al ojo.\n3. Pérdida de ingresos: Los campesinos pierden hasta un 35% de sobreprecio en mercados de exportación porque no tienen cómo demostrar que su cacao es 100% huilense y de calidad.\n\n¿Cómo lo resuelve nuestra plataforma?\n1. Elimina los papeles centralizando el inventario en la nube.\n2. Dispara alertas automáticas si la merma supera el 15% técnico permitido.\n3. Calcula el costo exacto por kilo ($ COP/kg) para fijar precios rentables.\n4. Permite aislar y bloquear lotes de mala calidad para que no contaminen la bodega.\n5. Emite un certificado de trazabilidad con QR para recuperar ese 35% de sobreprecio.\n\nVeámoslo ahora mismo en vivo en el sistema:”',
                italics: true,
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // MINUTOS 3 Y 4
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            children: [new TextRun({ text: "⏱️ MINUTOS 3 Y 4 (2:00 - 4:00) — Demostración del Software en Vivo", bold: true })],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "👤 Habla y Maneja Pantalla: ", bold: true }),
              new TextRun({ text: "Brayan Gasca" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "🖥️ En Pantalla: ", bold: true }),
              new TextRun({ text: "Navegador Web en Pantalla Completa (http://localhost:3000)" }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• PASO 1 — MÓDULO DE RECEPCIÓN E INVENTARIO (/lotes):\n", bold: true }),
              new TextRun({
                text: '“Aquí estamos en el módulo de recepción. Miren el panel superior: tenemos 4 lotes registrados con 480 kg disponibles en bodega.\nMiren esta innovación de seguridad: implementamos el control Habeas Data (Ley 1581). Miren cómo cambio de Nombres Reales a Modo Anónimo. Como soy Administrador, tengo la insignia ADMIN y puedo auditar a Don Carlos Dussán; si entra un operario común, el botón se bloquea con candado para proteger al campesino.\nAdemás, miren el lote CAC003 de Algeciras: aplicamos el Bloqueo Preventivo de Calidad (RF09); queda congelado con su motivo técnico para que nadie lo pueda mezclar ni procesar por error.”\n\n',
                italics: true,
              }),
              new TextRun({ text: "• PASO 2 — MÓDULO DE TRANSFORMACIÓN Y MERMAS (/transformaciones):\n", bold: true }),
              new TextRun({
                text: '“Pasamos al módulo de procesos: Fermentación y Secado. El sistema valida el balance de inventario: si intentamos procesar más kilos de los que hay disponibles, se rechaza la operación.\nMiren este caso real con el lote CAC004: ingresaron 100 kg y salieron 84 kg. Hubo una pérdida de 16 kg (16% de merma). Como la norma tolera hasta el 15%, miren cómo salta la Alerta Roja de Merma Crítica (RF04) obligando a justificar la incidencia.\nAl mismo tiempo, divide los gastos operativos y calcula en vivo el Costo Unitario real: $2.000 COP por kilogramo (RF05), asegurando que la cooperativa no venda a pérdida.”\n\n',
                italics: true,
              }),
              new TextRun({ text: "• PASO 3 — FICHA PÚBLICA Y CÓDIGO QR (/trazabilidad):\n", bold: true }),
              new TextRun({
                text: '“Finalmente, la Ficha Oficial de Trazabilidad. Miren la pantalla: cargó el lote CAC004 de Don Carlos Dussán con su municipio en Rivera y su línea de tiempo.\nInvito a los señores jurados a apuntar la cámara de sus celulares a la pantalla: gracias a la red local, el código QR abre de inmediato el certificado digital en sus teléfonos.\nEl comprador verifica el origen y las etapas superadas, manteniendo bajo estricta confidencialidad comercial los costos internos de la cooperativa (RF06).”',
                italics: true,
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // MINUTO 5
          new Paragraph({
            heading: HeadingLevel.HEADING_3,
            children: [new TextRun({ text: "⏱️ MINUTO 5 (4:00 - 5:00) — Modelo de Negocio, Confiabilidad y Cierre", bold: true })],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "👤 Habla Samuel: ", bold: true }),
              new TextRun({
                text: '“En viabilidad e impacto: Beneficiamos a más de 300 familias cacaoteras de Rivera, Campoalegre y Algeciras eliminando intermediarios y recuperando ese 35% de sobreprecio. Operamos bajo modelo SaaS con suscripción mensual para asociaciones más micro-tarifa por certificado QR de exportación.”\n\n',
                italics: true,
              }),
              new TextRun({ text: "👤 Habla Brayan: ", bold: true }),
              new TextRun({
                text: '“En la parte técnica: Next.js, Supabase PostgreSQL, Clerk y 6 pruebas unitarias automatizadas que validan todas las fórmulas en 40 ms con cero error contable.\nPróximos pasos: integrar sensores IoT para medir temperatura y pH en fermentación.\nCon Cacao Trazabilidad Huila transformamos el sudor del campesino en valor certificado para el mundo. ¡Muchas gracias jurados, somos syntax_error!”',
                italics: true,
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // BANCO DE PREGUNTAS DEL JURADO
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: "3. BANCO DE RESPUESTAS RÁPIDAS PARA EL JURADO (MINUTOS 6 AL 8)",
                bold: true,
                color: "047857",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "1. ¿Qué pasa si en el acopio o finca no hay internet?\n", bold: true }),
              new TextRun({
                text: "Respuesta (Samuel): “La plataforma está construida con arquitectura Mobile-First y PWA/cache local. El operario registra los datos en su teléfono y al detectar señal Wi-Fi o datos móviles, sincroniza automáticamente de forma transaccional con PostgreSQL.”\n\n",
              }),
              new TextRun({ text: "2. ¿Cómo evitan que un operario altere costos o registre duplicados?\n", bold: true }),
              new TextRun({
                text: "Respuesta (Brayan): “Con 3 barreras de seguridad: 1) Roles con Clerk (RBAC) donde el operario solo registra y no puede modificar reglas; 2) Clave de idempotencia única por cada formulario que evita envíos dobles si la red parpadea; y 3) Tabla inmutable de auditoría (auditoria_logs) en la base de datos que registra quién, cuándo y qué valor cambió.”\n\n",
              }),
              new TextRun({ text: "3. ¿Por qué los costos son privados en el código QR?\n", bold: true }),
              new TextRun({
                text: "Respuesta (Samuel): “Por confidencialidad comercial y protección al campesino (RF06). El comprador necesita auditar calidad y origen, pero si revelamos los costos internos de procesamiento, debilitaríamos la capacidad de negociación de precios de la cooperativa.”\n\n",
              }),
              new TextRun({ text: "4. ¿Qué validan en las pruebas automáticas?\n", bold: true }),
              new TextRun({
                text: "Respuesta (Brayan): “Tenemos 6 pruebas unitarias nativas en TypeScript (npm test) que prueban: el disparo exacto de la alerta al superar 15.0% de merma, salvaguarda de división por cero en costos, balance que impide sobreconsumo de inventario y prohibición estricta de procesar lotes bloqueados.”\n",
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // MATRIZ DE REQUISITOS
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: "4. MATRIZ DE REQUISITOS FUNCIONALES DEL RETO (RF01 AL RF12)",
                bold: true,
                color: "047857",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• RF01 (Recepción): ", bold: true }),
              new TextRun({ text: "Valida kilos > 0, genera ID único CAC00X, fecha y productor con Habeas Data.\n" }),
              new TextRun({ text: "• RF02 (Clasificación): ", bold: true }),
              new TextRun({ text: "Filtra origen obligatorio municipal (Rivera, Campoalegre y Algeciras).\n" }),
              new TextRun({ text: "• RF03 (Trazabilidad): ", bold: true }),
              new TextRun({ text: "Recorrido completo desde la entrega del grano hasta el lote terminado.\n" }),
              new TextRun({ text: "• RF04 (Mermas > 15%): ", bold: true }),
              new TextRun({ text: "Alerta visual roja y obligatoriedad de justificar técnicamente la pérdida.\n" }),
              new TextRun({ text: "• RF05 (Costo Unitario): ", bold: true }),
              new TextRun({ text: "Cálculo en $ COP/kg dividiendo gastos de etapa entre kilos de salida vendibles.\n" }),
              new TextRun({ text: "• RF06 (Ficha QR Segura): ", bold: true }),
              new TextRun({ text: "Acceso público al certificado de origen sin revelar costos ni datos privados.\n" }),
              new TextRun({ text: "• RF07 (Control RBAC): ", bold: true }),
              new TextRun({ text: "Diferenciación de roles (Operador registra / Admin gestiona estados y privacidad).\n" }),
              new TextRun({ text: "• RF08 (Balance Inventario): ", bold: true }),
              new TextRun({ text: "Saldo en tiempo real con bloqueo matemático ante consumos mayores al saldo.\n" }),
              new TextRun({ text: "• RF09 (Bloqueo Preventivo): ", bold: true }),
              new TextRun({ text: "Lotes fuera de estándar (CAC003) se congelan con motivo y no se procesan.\n" }),
              new TextRun({ text: "• RF10 (Auditoría Inmutable): ", bold: true }),
              new TextRun({ text: "Registro histórico persistente que no permite borrado de transacciones.\n" }),
              new TextRun({ text: "• RF11 (Filtros y Móvil): ", bold: true }),
              new TextRun({ text: "Interfaz táctil adaptada para celulares con navegación inferior estilo app.\n" }),
              new TextRun({ text: "• RF12 (Margen Comercial): ", bold: true }),
              new TextRun({ text: "Margen sugerido del 20% para fijar precios de venta competitivos y rentables.\n" }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, "..", "DOCUMENTACION_Y_GUION_OFICIAL_SYNTAX_ERROR.docx");
  fs.writeFileSync(outPath, buffer);
  console.log("Documento generado con éxito en:", outPath);
}

generate().catch(console.error);
