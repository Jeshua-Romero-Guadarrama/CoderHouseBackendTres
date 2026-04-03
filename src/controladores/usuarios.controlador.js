// Se implementa el modulo usuarios controlador del servidor de ecommerce.
const { usuariosServicio } = require('../servicios/usuarios.servicio');
const { crearUsuarioDTO } = require('../dto/usuario.dto');

const obtenerUsuarios = async (solicitud, respuesta, siguiente) => {
  try {
    const usuarios = await usuariosServicio.listarUsuarios();
    return respuesta.json({ estado: 'success', usuarios: usuarios.map(crearUsuarioDTO) });
  } catch (error) {
    return siguiente(error);
  }
};

const obtenerUsuarioPorId = async (solicitud, respuesta, siguiente) => {
  try {
    const usuario = await usuariosServicio.obtenerUsuarioPorId(solicitud.params.id);
    return respuesta.json({ estado: 'success', usuario: crearUsuarioDTO(usuario) });
  } catch (error) {
    return siguiente(error);
  }
};

const crearUsuario = async (solicitud, respuesta, siguiente) => {
  try {
    const usuarioCreado = await usuariosServicio.registrarUsuario(solicitud.body, {
      permitirRolAdmin: true
    });
    return respuesta.status(201).json({ estado: 'success', usuario: crearUsuarioDTO(usuarioCreado) });
  } catch (error) {
    return siguiente(error);
  }
};

const actualizarUsuario = async (solicitud, respuesta, siguiente) => {
  try {
    const usuarioActualizado = await usuariosServicio.actualizarUsuario(
      solicitud.params.id,
      solicitud.body
    );
    return respuesta.json({ estado: 'success', usuario: crearUsuarioDTO(usuarioActualizado) });
  } catch (error) {
    return siguiente(error);
  }
};

const eliminarUsuario = async (solicitud, respuesta, siguiente) => {
  try {
    await usuariosServicio.eliminarUsuario(solicitud.params.id);
    return respuesta.json({ estado: 'success', mensaje: 'Usuario eliminado' });
  } catch (error) {
    return siguiente(error);
  }
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
};
