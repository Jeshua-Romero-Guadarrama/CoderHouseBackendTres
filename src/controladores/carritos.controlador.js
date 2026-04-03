const { carritosServicio } = require('../servicios/carritos.servicio');
const { crearTicketDTO } = require('../dto/ticket.dto');

// Se obtiene el carrito del usuario autenticado.
const obtenerCarrito = async (solicitud, respuesta, siguiente) => {
  try {
    const carrito = await carritosServicio.obtenerCarritoPorId(
      solicitud.params.cid,
      solicitud.usuario
    );
    return respuesta.json({ estado: 'success', carrito });
  } catch (error) {
    return siguiente(error);
  }
};

// Se agrega un producto al carrito propio del usuario.
const agregarProductoAlCarrito = async (solicitud, respuesta, siguiente) => {
  try {
    const carrito = await carritosServicio.agregarProducto(
      solicitud.params.cid,
      solicitud.params.pid,
      solicitud.body.cantidad || 1,
      solicitud.usuario
    );
    return respuesta.json({
      estado: 'success',
      mensaje: 'Producto agregado al carrito',
      carrito
    });
  } catch (error) {
    return siguiente(error);
  }
};

// Se ejecuta la compra del carrito y se devuelve el ticket generado.
const finalizarCompra = async (solicitud, respuesta, siguiente) => {
  try {
    const resultadoCompra = await carritosServicio.comprarCarrito(
      solicitud.params.cid,
      solicitud.usuario
    );

    return respuesta.json({
      estado: 'success',
      mensaje: resultadoCompra.mensaje,
      tipo_compra: resultadoCompra.estado,
      ticket: crearTicketDTO(resultadoCompra.ticket),
      productos_sin_stock: resultadoCompra.productos_sin_stock
    });
  } catch (error) {
    return siguiente(error);
  }
};

module.exports = { obtenerCarrito, agregarProductoAlCarrito, finalizarCompra };
