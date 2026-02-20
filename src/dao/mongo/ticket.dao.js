const { TicketModelo } = require('../../modelos/ticket.model');

class TicketDaoMongo {
  // Se crea un ticket con los datos de la compra procesada.
  async crear(datosTicket) {
    return TicketModelo.create(datosTicket);
  }

  // Se busca un ticket por id.
  async buscarPorId(id, opciones = {}) {
    const consulta = TicketModelo.findById(id);

    if (opciones.lean) {
      consulta.lean();
    }

    return consulta;
  }

  // Se listan tickets filtrados y ordenados por fecha descendente.
  async listar(filtro = {}, opciones = {}) {
    const consulta = TicketModelo.find(filtro).sort({ createdAt: -1 });

    if (opciones.lean) {
      consulta.lean();
    }

    return consulta;
  }
}

module.exports = { TicketDaoMongo };
