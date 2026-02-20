const { productosServicio } = require('../servicios/productos.servicio');
const { crearProductoDTO } = require('../dto/producto.dto');

// Se listan todos los productos disponibles en el catalogo.
const listarProductos = async (solicitud, respuesta, siguiente) => {
  try {
    const productos = await productosServicio.listarProductos();
    return respuesta.json({ estado: 'success', productos: productos.map(crearProductoDTO) });
  } catch (error) {
    return siguiente(error);
  }
};

// Se obtiene el detalle de un producto por su identificador.
const obtenerProductoPorId = async (solicitud, respuesta, siguiente) => {
  try {
    const producto = await productosServicio.obtenerProductoPorId(solicitud.params.pid);
    return respuesta.json({ estado: 'success', producto: crearProductoDTO(producto) });
  } catch (error) {
    return siguiente(error);
  }
};

// Se crea un producto nuevo con permisos de administrador.
const crearProducto = async (solicitud, respuesta, siguiente) => {
  try {
    const producto = await productosServicio.crearProducto(solicitud.body);
    return respuesta.status(201).json({ estado: 'success', producto: crearProductoDTO(producto) });
  } catch (error) {
    return siguiente(error);
  }
};

// Se actualiza un producto existente por identificador.
const actualizarProducto = async (solicitud, respuesta, siguiente) => {
  try {
    const producto = await productosServicio.actualizarProducto(solicitud.params.pid, solicitud.body);
    return respuesta.json({ estado: 'success', producto: crearProductoDTO(producto) });
  } catch (error) {
    return siguiente(error);
  }
};

// Se elimina un producto del catalogo.
const eliminarProducto = async (solicitud, respuesta, siguiente) => {
  try {
    await productosServicio.eliminarProducto(solicitud.params.pid);
    return respuesta.json({ estado: 'success', mensaje: 'Producto eliminado' });
  } catch (error) {
    return siguiente(error);
  }
};

module.exports = {
  listarProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};
