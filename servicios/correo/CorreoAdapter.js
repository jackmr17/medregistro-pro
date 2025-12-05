// servicios/correo/CorreoAdapter.js
class CorreoAdapter {
  /**
   * Enviar correo de confirmación de reserva.
   * @param {object} datos
   * {
   *   correoPaciente, nombrePaciente, rut,
   *   fecha, hora, clinica, especialidad, doctor, monto, metodo_pago, estado
   * }
   */
  async enviarConfirmacionReserva(datos) {
    throw new Error('enviarConfirmacionReserva() debe ser implementado por el adapter concreto');
  }
}

module.exports = CorreoAdapter;
