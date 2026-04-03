const { UsuarioModelo } = require('../../modelos/usuario.model');

class UsuarioDaoMongo {
  // Se crea un usuario en la coleccion correspondiente.
  async crear(datosUsuario) {
    return UsuarioModelo.create(datosUsuario);
  }

  // Se busca un usuario por su correo electronico.
  async buscarPorCorreo(correo) {
    return UsuarioModelo.findOne({ email: correo.toLowerCase() });
  }

  // Se busca un usuario por id con opciones de proyeccion/lean.
  async buscarPorId(id, opciones = {}) {
    const consulta = UsuarioModelo.findById(id);

    if (opciones.proyeccion) {
      consulta.select(opciones.proyeccion);
    }

    if (opciones.lean) {
      consulta.lean();
    }

    return consulta;
  }

  // Se lista el conjunto de usuarios disponibles.
  async listar(opciones = {}) {
    const consulta = UsuarioModelo.find();

    if (opciones.proyeccion) {
      consulta.select(opciones.proyeccion);
    }

    if (opciones.lean) {
      consulta.lean();
    }

    return consulta;
  }

  // Se actualiza un usuario por id aplicando validaciones de schema.
  async actualizarPorId(id, datosActualizacion, opciones = {}) {
    const consulta = UsuarioModelo.findByIdAndUpdate(id, datosActualizacion, {
      new: true,
      runValidators: true
    });

    if (opciones.proyeccion) {
      consulta.select(opciones.proyeccion);
    }

    if (opciones.lean) {
      consulta.lean();
    }

    return consulta;
  }

  // Se elimina un usuario por su identificador.
  async eliminarPorId(id) {
    return UsuarioModelo.findByIdAndDelete(id);
  }

  // Se contabilizan usuarios segun un filtro puntual.
  async contarPorFiltro(filtro) {
    return UsuarioModelo.countDocuments(filtro);
  }
}

module.exports = { UsuarioDaoMongo };
