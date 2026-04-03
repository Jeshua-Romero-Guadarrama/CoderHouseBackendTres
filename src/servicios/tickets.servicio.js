// Se implementa el modulo tickets servicio del servidor de ecommerce.
const { ticketRepositorio } = require('../repositorios/ticket.repositorio');
const { ErrorAplicacion } = require('../utils/error-aplicacion');

class TicketsServicio {
  constructor({ ticketRepo = ticketRepositorio } = {}) {
    this.ticketRepo = ticketRepo;
  }

  async obtenerTicketPorId(id) {
    const ticket = await this.ticketRepo.buscarPorId(id, { lean: true });
    if (!ticket) {
      throw new ErrorAplicacion('Ticket no encontrado', 404, 'TICKET_NO_ENCONTRADO');
    }

    return ticket;
  }

  async listarTicketsPorComprador(emailComprador) {
    return this.ticketRepo.listar({ purchaser: String(emailComprador).toLowerCase() }, { lean: true });
  }
}

const ticketsServicio = new TicketsServicio();

module.exports = { TicketsServicio, ticketsServicio };
