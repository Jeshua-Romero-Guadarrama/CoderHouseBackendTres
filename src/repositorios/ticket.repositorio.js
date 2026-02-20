// Se implementa el modulo ticket repositorio del servidor de ecommerce.
const { TicketDaoMongo } = require('../dao/mongo/ticket.dao');

class TicketRepositorio {
  constructor(dao = new TicketDaoMongo()) {
    this.dao = dao;
  }

  crear(datosTicket) {
    return this.dao.crear(datosTicket);
  }

  buscarPorId(id, opciones = {}) {
    return this.dao.buscarPorId(id, opciones);
  }

  listar(filtro = {}, opciones = {}) {
    return this.dao.listar(filtro, opciones);
  }
}

const ticketRepositorio = new TicketRepositorio();

module.exports = { TicketRepositorio, ticketRepositorio };
