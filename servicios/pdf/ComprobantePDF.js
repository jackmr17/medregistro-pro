// servicios/pdf/ComprobantePDF.js
const PDFDocument = require('pdfkit');

function generarComprobantePDF(reserva, outputStream) {
  const leftMargin = 50;
  const doc = new PDFDocument({ margin: leftMargin });

  doc.pipe(outputStream);

  const montoFormato = new Intl.NumberFormat('es-CL').format(reserva.monto || 0);
  const estadoTexto = reserva.estado.toUpperCase();

  // ENCABEZADO
  doc
    .fontSize(20)
    .fillColor('#1d4ed8')
    .text('MedRegistro Pro', { align: 'left' });

  doc
    .moveDown(0.3)
    .fontSize(12)
    .fillColor('#4b5563')
    .text('Comprobante de reserva médica', { align: 'left' });

  doc
    .moveDown(0.5)
    .fontSize(10)
    .fillColor('#6b7280')
    .text(`N° reserva: ${reserva.id}`, { align: 'right' })
    .text(`Emitido: ${new Date().toLocaleString('es-CL')}`, { align: 'right' });

  doc
    .moveDown(0.5)
    .strokeColor('#e5e7eb')
    .lineWidth(1)
    .moveTo(leftMargin, doc.y)
    .lineTo(550, doc.y)
    .stroke();

  doc.moveDown(1);
  const startY = doc.y;

  // PACIENTE
  doc
    .fontSize(11)
    .fillColor('#111827')
    .text('Datos del paciente', leftMargin, startY);

  doc
    .moveDown(0.5)
    .fontSize(10)
    .fillColor('#374151')
    .text(`Nombre: ${reserva.nombres} ${reserva.apellidos}`)
    .text(`RUT: ${reserva.rut}`)
    .text(`Correo: ${reserva.correo || '-'}`)
    .text(`Teléfono: ${reserva.telefono || '-'}`);

  // CLÍNICA
  const col2X = 310;
  doc
    .fontSize(11)
    .fillColor('#111827')
    .text('Datos de la clínica', col2X, startY);

  doc
    .moveDown(0.5)
    .fontSize(10)
    .fillColor('#374151')
    .text(`Clínica: ${reserva.clinica}`, col2X)
    .text(`Dirección: ${reserva.clinica_direccion || '-'}`, col2X)
    .text(`Teléfono: ${reserva.clinica_telefono || '-'}`, col2X);

  // DETALLE CITA
  doc.moveDown(2);
  doc
    .fontSize(11)
    .fillColor('#111827')
    .text('Detalle de la cita', leftMargin);

  doc
    .moveDown(0.5)
    .fontSize(10)
    .fillColor('#374151');

  const detalleTop = doc.y;
  const colWidths = [80, 60, 120, 140, 70, 80];
  const tableX = leftMargin;
  const headers = ['Fecha', 'Hora', 'Especialidad', 'Profesional', 'Estado', 'Monto'];

  let x = tableX;
  doc.fontSize(10).fillColor('#4b5563').font('Helvetica-Bold');
  headers.forEach((h, i) => {
    doc.text(h, x, detalleTop, {
      width: colWidths[i],
      align: i === 5 ? 'right' : 'left'
    });
    x += colWidths[i];
  });

  doc
    .moveTo(tableX, detalleTop + 14)
    .lineTo(tableX + colWidths.reduce((a, b) => a + b, 0), detalleTop + 14)
    .strokeColor('#e5e7eb')
    .lineWidth(0.8)
    .stroke();

  const filaY = detalleTop + 18;
  x = tableX;
  doc.font('Helvetica').fillColor('#111827');

  const filaDatos = [
    reserva.fecha_atencion,
    reserva.hora_atencion,
    reserva.especialidad,
    reserva.doctor,
    estadoTexto,
    `$${montoFormato}`
  ];

  filaDatos.forEach((valor, i) => {
    doc.text(valor, x, filaY, {
      width: colWidths[i],
      align: i === 5 ? 'right' : 'left'
    });
    x += colWidths[i];
  });

  // RESUMEN PAGO
  doc.moveDown(4);
  doc.x = leftMargin;

  doc
    .fontSize(11)
    .fillColor('#111827')
    .text('Resumen de pago', { width: 500 });

  doc
    .moveDown(0.5)
    .fontSize(10)
    .fillColor('#374151')
    .text(`Método de pago: ${reserva.metodo_pago.toUpperCase()}`, { width: 500 })
    .text(`Estado de la reserva: ${estadoTexto}`, { width: 500 });

  doc
    .moveDown(0.7)
    .fontSize(12)
    .fillColor('#111827')
    .text(`Total a pagar: $${montoFormato}`, { width: 500, align: 'right' });

  // NOTAS
  doc.moveDown(2);
  doc.x = leftMargin;

  doc
    .fontSize(11)
    .fillColor('#111827')
    .text('Notas importantes', { width: 500 });

  doc
    .moveDown(0.5)
    .fontSize(9.5)
    .fillColor('#6b7280')
    .list(
      [
        'Presenta este comprobante en recepción el día de tu cita.',
        'Llega con al menos 10 minutos de anticipación.',
        'Si no puedes asistir, cancela tu hora con mínimo 24 horas de anticipación.',
        'Este documento no reemplaza la boleta o factura de la clínica.'
      ],
      {
        bulletRadius: 2,
        width: 500
      }
    );

  // PIE
  doc.moveDown(2);
  doc
    .fontSize(8.5)
    .fillColor('#9ca3af')
    .text(
      'MedRegistro Pro · Sistema de reservas médicas – Documento generado automáticamente, no requiere firma.',
      { align: 'center' }
    );

  doc.end();
}

module.exports = { generarComprobantePDF };
