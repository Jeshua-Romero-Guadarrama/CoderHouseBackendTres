// Se implementa el modulo ticket dto del servidor de ecommerce.
const crearTicketDTO = (ticket) => {
  if (!ticket) {
    return null;
  }

  return {
    id: ticket._id?.toString() || ticket.id,
    code: ticket.code,
    purchase_datetime: ticket.purchase_datetime,
    amount: ticket.amount,
    purchaser: ticket.purchaser,
    cart: ticket.cart?._id?.toString() || ticket.cart,
    estado: ticket.estado,
    productos: ticket.productos || [],
    productos_sin_stock: ticket.productos_sin_stock || []
  };
};

module.exports = { crearTicketDTO };
