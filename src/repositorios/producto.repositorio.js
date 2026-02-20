// Se implementa el modulo producto repositorio del servidor de ecommerce.
const { ProductoDaoMongo } = require('../dao/mongo/producto.dao');

class ProductoRepositorio {
  constructor(dao = new ProductoDaoMongo()) {
    this.dao = dao;
  }

  crear(datosProducto) {
    return this.dao.crear(datosProducto);
  }

  listar(opciones = {}) {
    return this.dao.listar(opciones);
  }

  buscarPorId(id, opciones = {}) {
    return this.dao.buscarPorId(id, opciones);
  }

  buscarPorCodigo(codigo) {
    return this.dao.buscarPorCodigo(codigo);
  }

  actualizarPorId(id, datosActualizacion, opciones = {}) {
    return this.dao.actualizarPorId(id, datosActualizacion, opciones);
  }

  eliminarPorId(id) {
    return this.dao.eliminarPorId(id);
  }
}

const productoRepositorio = new ProductoRepositorio();

module.exports = { ProductoRepositorio, productoRepositorio };
