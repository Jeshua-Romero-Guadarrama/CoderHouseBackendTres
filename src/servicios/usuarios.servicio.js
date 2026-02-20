const { crearHash } = require('../utils/seguridad');
const { ErrorAplicacion } = require('../utils/error-aplicacion');
const { usuarioRepositorio } = require('../repositorios/usuario.repositorio');
const { carritoRepositorio } = require('../repositorios/carrito.repositorio');
const { permitirRegistroAdmin } = require('../configuracion/entorno');

class UsuariosServicio {
  constructor({
    usuarioRepo = usuarioRepositorio,
    carritoRepo = carritoRepositorio
  } = {}) {
    this.usuarioRepo = usuarioRepo;
    this.carritoRepo = carritoRepo;
  }

  async registrarUsuario(datosUsuario, opciones = {}) {
    // Se valida la entrada y se crea el usuario con carrito asociado.
    const { permitirRolAdmin = false } = opciones;
    const {
      first_name: nombre,
      last_name: apellido,
      email,
      age: edad,
      password: contrasena,
      role
    } = datosUsuario;

    if (!nombre || !apellido || !email || !edad || !contrasena) {
      throw new ErrorAplicacion('Faltan campos obligatorios', 400, 'CAMPOS_OBLIGATORIOS');
    }

    const correoNormalizado = String(email).toLowerCase().trim();
    const usuarioExistente = await this.usuarioRepo.buscarPorCorreo(correoNormalizado);
    if (usuarioExistente) {
      throw new ErrorAplicacion('El email ya existe', 409, 'EMAIL_DUPLICADO');
    }

    const carrito = await this.carritoRepo.crearCarritoVacio();

    let rolFinal = 'user';
    if (role === 'admin' && (permitirRegistroAdmin || permitirRolAdmin)) {
      rolFinal = 'admin';
    } else if (role === 'admin' && !permitirRegistroAdmin) {
      const cantidadAdmins = await this.usuarioRepo.contarPorFiltro({ role: 'admin' });
      rolFinal = cantidadAdmins === 0 ? 'admin' : 'user';
    } else if (role === 'user') {
      rolFinal = 'user';
    }

    const usuarioCreado = await this.usuarioRepo.crear({
      first_name: nombre,
      last_name: apellido,
      email: correoNormalizado,
      age: Number(edad),
      password: crearHash(contrasena),
      cart: carrito._id,
      role: rolFinal
    });

    return usuarioCreado;
  }

  async listarUsuarios() {
    // Se lista el conjunto de usuarios omitiendo informacion sensible.
    return this.usuarioRepo.listar({ proyeccion: '-password -__v', lean: true });
  }

  async obtenerUsuarioPorId(id) {
    // Se busca un usuario puntual y se controla su existencia.
    const usuario = await this.usuarioRepo.buscarPorId(id, {
      proyeccion: '-password -__v',
      lean: true
    });

    if (!usuario) {
      throw new ErrorAplicacion('Usuario no encontrado', 404, 'USUARIO_NO_ENCONTRADO');
    }

    return usuario;
  }

  async buscarUsuarioAutenticacionPorCorreo(correo) {
    // Se obtiene el usuario para los flujos de autenticacion.
    return this.usuarioRepo.buscarPorCorreo(String(correo).toLowerCase().trim());
  }

  async buscarUsuarioCompletoPorId(id) {
    // Se obtiene el documento completo para procesos internos.
    return this.usuarioRepo.buscarPorId(id);
  }

  async actualizarUsuario(id, datosActualizacion) {
    // Se normalizan y validan datos antes de persistir cambios.
    const actualizacion = { ...datosActualizacion };

    if (actualizacion.email) {
      actualizacion.email = String(actualizacion.email).toLowerCase().trim();
      const usuarioConCorreo = await this.usuarioRepo.buscarPorCorreo(actualizacion.email);
      if (usuarioConCorreo && usuarioConCorreo._id.toString() !== id.toString()) {
        throw new ErrorAplicacion('El email ya existe', 409, 'EMAIL_DUPLICADO');
      }
    }

    if (actualizacion.password) {
      actualizacion.password = crearHash(actualizacion.password);
    }

    if (actualizacion.role && !['admin', 'user'].includes(actualizacion.role)) {
      throw new ErrorAplicacion('Rol invalido', 400, 'ROL_INVALIDO');
    }

    if (typeof actualizacion.age !== 'undefined') {
      actualizacion.age = Number(actualizacion.age);
    }

    const usuarioActualizado = await this.usuarioRepo.actualizarPorId(id, actualizacion, {
      proyeccion: '-password -__v',
      lean: true
    });

    if (!usuarioActualizado) {
      throw new ErrorAplicacion('Usuario no encontrado', 404, 'USUARIO_NO_ENCONTRADO');
    }

    return usuarioActualizado;
  }

  async eliminarUsuario(id) {
    // Se elimina el usuario y tambien su carrito asociado.
    const usuarioEliminado = await this.usuarioRepo.eliminarPorId(id);
    if (!usuarioEliminado) {
      throw new ErrorAplicacion('Usuario no encontrado', 404, 'USUARIO_NO_ENCONTRADO');
    }

    if (usuarioEliminado.cart) {
      await this.carritoRepo.eliminarPorId(usuarioEliminado.cart);
    }

    return usuarioEliminado;
  }
}

const usuariosServicio = new UsuariosServicio();

module.exports = { UsuariosServicio, usuariosServicio };
