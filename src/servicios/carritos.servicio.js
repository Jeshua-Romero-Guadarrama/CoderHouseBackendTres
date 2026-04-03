const { carritoRepositorio } = require('../repositorios/carrito.repositorio');
const { productoRepositorio } = require('../repositorios/producto.repositorio');
const { ticketRepositorio } = require('../repositorios/ticket.repositorio');
const { generarCodigoTicket } = require('../utils/generador-codigo');
const { ErrorAplicacion } = require('../utils/error-aplicacion');

class CarritosServicio {
  constructor({
    carritoRepo = carritoRepositorio,
    productoRepo = productoRepositorio,
    ticketRepo = ticketRepositorio
  } = {}) {
    this.carritoRepo = carritoRepo;
    this.productoRepo = productoRepo;
    this.ticketRepo = ticketRepo;
  }

  validarCarritoPropio(carritoId, usuarioActual) {
    // Se valida que el carrito solicitado pertenezca al usuario actual.
    if (!usuarioActual) {
      throw new ErrorAplicacion('No autenticado', 401, 'NO_AUTENTICADO');
    }

    const carritoUsuario = usuarioActual.cart?._id?.toString() || usuarioActual.cart?.toString();
    if (!carritoUsuario || carritoUsuario !== carritoId.toString()) {
      throw new ErrorAplicacion(
        'Solo puedes operar sobre tu propio carrito',
        403,
        'CARRITO_NO_AUTORIZADO'
      );
    }
  }

  async obtenerCarritoPorId(carritoId, usuarioActual) {
    // Se obtiene el carrito con detalle de productos asociados.
    this.validarCarritoPropio(carritoId, usuarioActual);

    const carrito = await this.carritoRepo.buscarPorId(carritoId, { populate: true, lean: true });
    if (!carrito) {
      throw new ErrorAplicacion('Carrito no encontrado', 404, 'CARRITO_NO_ENCONTRADO');
    }

    return carrito;
  }

  async agregarProducto(carritoId, productoId, cantidad = 1, usuarioActual) {
    // Se agrega o acumula cantidad de un producto en el carrito propio.
    this.validarCarritoPropio(carritoId, usuarioActual);

    const cantidadFinal = Number(cantidad);
    if (!Number.isInteger(cantidadFinal) || cantidadFinal < 1) {
      throw new ErrorAplicacion('La cantidad debe ser un entero mayor o igual a 1', 400, 'CANTIDAD_INVALIDA');
    }

    const producto = await this.productoRepo.buscarPorId(productoId);
    if (!producto || !producto.status) {
      throw new ErrorAplicacion('Producto no disponible', 404, 'PRODUCTO_NO_DISPONIBLE');
    }

    const carrito = await this.carritoRepo.buscarPorId(carritoId);
    if (!carrito) {
      throw new ErrorAplicacion('Carrito no encontrado', 404, 'CARRITO_NO_ENCONTRADO');
    }

    const productosActuales = carrito.productos.map((item) => ({
      producto: item.producto.toString(),
      cantidad: item.cantidad
    }));

    const indiceProducto = productosActuales.findIndex(
      (item) => item.producto.toString() === productoId.toString()
    );

    if (indiceProducto >= 0) {
      productosActuales[indiceProducto].cantidad += cantidadFinal;
    } else {
      productosActuales.push({ producto: productoId, cantidad: cantidadFinal });
    }

    return this.carritoRepo.reemplazarProductos(carritoId, productosActuales, {
      populate: true,
      lean: true
    });
  }

  async comprarCarrito(carritoId, usuarioActual) {
    // Se procesa la compra, validando stock y generando ticket.
    this.validarCarritoPropio(carritoId, usuarioActual);

    const carrito = await this.carritoRepo.buscarPorId(carritoId, { populate: true });
    if (!carrito) {
      throw new ErrorAplicacion('Carrito no encontrado', 404, 'CARRITO_NO_ENCONTRADO');
    }

    if (!carrito.productos.length) {
      throw new ErrorAplicacion('El carrito esta vacio', 400, 'CARRITO_VACIO');
    }

    let totalCompra = 0;
    const productosComprados = [];
    const productosSinStock = [];
    const productosRemanentes = [];

    for (const item of carrito.productos) {
      // Se separan productos comprables y no comprables segun stock.
      const productoDocumento = item.producto;
      const cantidadSolicitada = item.cantidad;

      if (!productoDocumento || !productoDocumento._id) {
        continue;
      }

      const idProducto = productoDocumento._id;
      const stockDisponible = Number(productoDocumento.stock || 0);

      if (productoDocumento.status && stockDisponible >= cantidadSolicitada) {
        const precioUnitario = Number(productoDocumento.price);
        const subtotal = precioUnitario * cantidadSolicitada;
        totalCompra += subtotal;

        productosComprados.push({
          producto: idProducto,
          titulo: productoDocumento.title,
          cantidad: cantidadSolicitada,
          precio_unitario: precioUnitario,
          subtotal
        });

        await this.productoRepo.actualizarPorId(idProducto, {
          stock: stockDisponible - cantidadSolicitada
        });
      } else {
        productosSinStock.push({
          producto: idProducto,
          solicitado: cantidadSolicitada,
          disponible: stockDisponible
        });

        productosRemanentes.push({
          producto: idProducto,
          cantidad: cantidadSolicitada
        });
      }
    }

    await this.carritoRepo.reemplazarProductos(carritoId, productosRemanentes);

    if (!productosComprados.length) {
      // Se informa compra incompleta total cuando no se pudo comprar ningun item.
      return {
        estado: 'incompleta',
        mensaje: 'No se pudo completar la compra por falta de stock',
        ticket: null,
        productos_sin_stock: productosSinStock
      };
    }

    const ticketCreado = await this.ticketRepo.crear({
      // Se persiste el ticket con detalle de compra para auditoria.
      code: generarCodigoTicket(),
      amount: Number(totalCompra.toFixed(2)),
      purchaser: usuarioActual.email,
      cart: carritoId,
      productos: productosComprados,
      productos_sin_stock: productosSinStock,
      estado: productosSinStock.length ? 'incompleta' : 'completa'
    });

    return {
      estado: ticketCreado.estado,
      mensaje:
        ticketCreado.estado === 'completa'
          ? 'Compra completada correctamente'
          : 'Compra completada parcialmente por falta de stock en algunos productos',
      ticket: ticketCreado,
      productos_sin_stock: productosSinStock
    };
  }
}

const carritosServicio = new CarritosServicio();

module.exports = { CarritosServicio, carritosServicio };
