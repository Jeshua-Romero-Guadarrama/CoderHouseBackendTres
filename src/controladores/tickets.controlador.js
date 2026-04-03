// Se implementa el modulo tickets controlador del servidor de ecommerce.
const { ticketsServicio } = require('../servicios/tickets.servicio');
const { crearTicketDTO } = require('../dto/ticket.dto');

const listarMisTickets = async (solicitud, respuesta, siguiente) => {
  try {
    const tickets = await ticketsServicio.listarTicketsPorComprador(solicitud.usuario.email);
    return respuesta.json({ estado: 'success', tickets: tickets.map(crearTicketDTO) });
  } catch (error) {
    return siguiente(error);
  }
};

module.exports = { listarMisTickets };
