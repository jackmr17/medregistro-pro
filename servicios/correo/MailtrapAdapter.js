// servicios/correo/MailtrapAdapter.js
const nodemailer = require('nodemailer');
const CorreoAdapter = require('./CorreoAdapter');

// ⚠️ RELLENA ESTOS DATOS CON LOS QUE TE DA MAILTRAP
const MAILTRAP_HOST = 'sandbox.smtp.mailtrap.io';
const MAILTRAP_PORT = 2525;
const MAILTRAP_USER = 'fc358a887c5c71';
const MAILTRAP_PASS = '880bdebbe9b5de';
const MAILTRAP_FROM = 'MedRegistro Pro <no-reply@medregistro.local>';

class MailtrapAdapter extends CorreoAdapter {
  constructor() {
    super();
    this.transporter = nodemailer.createTransport({
      host: MAILTRAP_HOST,
      port: MAILTRAP_PORT,
      auth: {
        user: MAILTRAP_USER,
        pass: MAILTRAP_PASS
      }
    });
  }

  async enviarConfirmacionReserva(datos) {
    const {
      correoPaciente,
      nombrePaciente,
      rut,
      fecha,
      hora,
      clinica,
      especialidad,
      doctor,
      monto,
      metodo_pago,
      estado
    } = datos;

    const montoFmt = new Intl.NumberFormat('es-CL').format(monto || 0);

    const html = `
      <h2>Confirmación de reserva médica</h2>
      <p>Hola <strong>${nombrePaciente}</strong>,</p>
      <p>Tu reserva ha sido registrada en <strong>${clinica}</strong>.</p>

      <h3>Detalle de la cita</h3>
      <ul>
        <li><strong>Paciente:</strong> ${nombrePaciente} (${rut})</li>
        <li><strong>Especialidad:</strong> ${especialidad}</li>
        <li><strong>Profesional:</strong> ${doctor}</li>
        <li><strong>Fecha:</strong> ${fecha}</li>
        <li><strong>Hora:</strong> ${hora}</li>
        <li><strong>Método de pago:</strong> ${metodo_pago.toUpperCase()}</li>
        <li><strong>Estado:</strong> ${estado.toUpperCase()}</li>
        <li><strong>Monto:</strong> $${montoFmt}</li>
      </ul>

      <p>Te recomendamos llegar con 10 minutos de anticipación.</p>
      <p>MedRegistro Pro</p>
    `;

    await this.transporter.sendMail({
      from: MAILTRAP_FROM,
      to: correoPaciente,
      subject: 'Confirmación de reserva – MedRegistro Pro',
      html
    });
  }
}

module.exports = MailtrapAdapter;
