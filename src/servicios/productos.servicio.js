const { productoRepositorio } = require('../repositorios/producto.repositorio');
const { ErrorAplicacion } = require('../utils/error-aplicacion');

class ProductosServicio {
  constructor({ productoRepo = productoRepositorio } = {}) {
    this.productoRepo = productoRepo;
  }

  async crearProducto(datosProducto) {
    // Se valida la estructura del producto y se evita duplicar codigo.
    const {
      title,
      description,
      code,
      price,
      stock,
      category,
      status
    } = datosProducto;

    if (!title || !description || !code || typeof price === 'undefined' || typeof stock === 'undefined' || !category) {
      throw new ErrorAplicacion('Faltan campos obligatorios del producto', 400, 'CAMPOS_OBLIGATORIOS');
    }

    const productoConCodigo = await this.productoRepo.buscarPorCodigo(code);
    if (productoConCodigo) {
      throw new ErrorAplicacion('El codigo del producto ya existe', 409, 'CODIGO_DUPLICADO');
    }

    return this.productoRepo.crear({
      title: String(title).trim(),
      description: String(description).trim(),
      code: String(code).trim(),
      price: Number(price),
      stock: Number(stock),
      category: String(category).trim(),
      status: typeof status === 'undefined' ? true : Boolean(status)
    });
  }

  async listarProductos() {
    // Se devuelve el catalogo completo para consumo publico.
    return this.productoRepo.listar({ lean: true });
  }

  async obtenerProductoPorId(id) {
    // Se busca el producto y se informa si no existe.
    const producto = await this.productoRepo.buscarPorId(id, { lean: true });
    if (!producto) {
      throw new ErrorAplicacion('Producto no encontrado', 404, 'PRODUCTO_NO_ENCONTRADO');
    }

    return producto;
  }

  async actualizarProducto(id, datosActualizacion) {
    // Se aplican validaciones de unicidad y tipos antes de actualizar.
    const actualizacion = { ...datosActualizacion };

    if (actualizacion.code) {
      const existenteConCodigo = await this.productoRepo.buscarPorCodigo(actualizacion.code);
      if (existenteConCodigo && existenteConCodigo._id.toString() !== id.toString()) {
        throw new ErrorAplicacion('El codigo del producto ya existe', 409, 'CODIGO_DUPLICADO');
      }
    }

    if (typeof actualizacion.price !== 'undefined') {
      actualizacion.price = Number(actualizacion.price);
    }

    if (typeof actualizacion.stock !== 'undefined') {
      actualizacion.stock = Number(actualizacion.stock);
    }

    const producto = await this.productoRepo.actualizarPorId(id, actualizacion, { lean: true });
    if (!producto) {
      throw new ErrorAplicacion('Producto no encontrado', 404, 'PRODUCTO_NO_ENCONTRADO');
    }

    return producto;
  }

  async eliminarProducto(id) {
    // Se elimina el producto solicitado del repositorio.
    const producto = await this.productoRepo.eliminarPorId(id);
    if (!producto) {
      throw new ErrorAplicacion('Producto no encontrado', 404, 'PRODUCTO_NO_ENCONTRADO');
    }

    return producto;
  }
}

const productosServicio = new ProductosServicio();

module.exports = { ProductosServicio, productosServicio };
