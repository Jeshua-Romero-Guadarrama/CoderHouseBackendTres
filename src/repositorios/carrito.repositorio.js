// Se implementa el modulo carrito repositorio del servidor de ecommerce.
const { CarritoDaoMongo } = require('../dao/mongo/carrito.dao');

class CarritoRepositorio {
  constructor(dao = new CarritoDaoMongo()) {
    this.dao = dao;
  }

  crearCarritoVacio() {
    return this.dao.crearCarritoVacio();
  }

  buscarPorId(id, opciones = {}) {
    return this.dao.buscarPorId(id, opciones);
  }

  actualizarPorId(id, datosActualizacion, opciones = {}) {
    return this.dao.actualizarPorId(id, datosActualizacion, opciones);
  }

  reemplazarProductos(id, productos, opciones = {}) {
    return this.dao.reemplazarProductos(id, productos, opciones);
  }

  eliminarPorId(id) {
    return this.dao.eliminarPorId(id);
  }
}

const carritoRepositorio = new CarritoRepositorio();

module.exports = { CarritoRepositorio, carritoRepositorio };
