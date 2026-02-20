// Se implementa el modulo usuario repositorio del servidor de ecommerce.
const { UsuarioDaoMongo } = require('../dao/mongo/usuario.dao');

class UsuarioRepositorio {
  constructor(dao = new UsuarioDaoMongo()) {
    this.dao = dao;
  }

  crear(datosUsuario) {
    return this.dao.crear(datosUsuario);
  }

  buscarPorCorreo(correo) {
    return this.dao.buscarPorCorreo(correo);
  }

  buscarPorId(id, opciones = {}) {
    return this.dao.buscarPorId(id, opciones);
  }

  listar(opciones = {}) {
    return this.dao.listar(opciones);
  }

  actualizarPorId(id, datosActualizacion, opciones = {}) {
    return this.dao.actualizarPorId(id, datosActualizacion, opciones);
  }

  eliminarPorId(id) {
    return this.dao.eliminarPorId(id);
  }

  contarPorFiltro(filtro) {
    return this.dao.contarPorFiltro(filtro);
  }
}

const usuarioRepositorio = new UsuarioRepositorio();

module.exports = { UsuarioRepositorio, usuarioRepositorio };
