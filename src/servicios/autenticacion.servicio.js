// Se implementa el modulo autenticacion servicio del servidor de ecommerce.
const { compararHash } = require('../utils/seguridad');
const { usuariosServicio } = require('./usuarios.servicio');
const { ErrorAplicacion } = require('../utils/error-aplicacion');

class AutenticacionServicio {
  constructor({ usuarios = usuariosServicio } = {}) {
    this.usuarios = usuarios;
  }

  async autenticarCredenciales(correo, contrasena) {
    const usuario = await this.usuarios.buscarUsuarioAutenticacionPorCorreo(correo);
    if (!usuario) {
      return null;
    }

    const credencialesValidas = compararHash(contrasena, usuario.password);
    if (!credencialesValidas) {
      return null;
    }

    return usuario;
  }

  async obtenerUsuarioActual(idUsuario) {
    const usuario = await this.usuarios.buscarUsuarioCompletoPorId(idUsuario);
    if (!usuario) {
      throw new ErrorAplicacion('Usuario no encontrado', 401, 'TOKEN_INVALIDO');
    }

    return usuario;
  }
}

const autenticacionServicio = new AutenticacionServicio();

module.exports = { AutenticacionServicio, autenticacionServicio };
