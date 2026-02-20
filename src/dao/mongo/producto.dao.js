const { ProductoModelo } = require('../../modelos/producto.model');

class ProductoDaoMongo {
  // Se crea un producto en la base de datos.
  async crear(datosProducto) {
    return ProductoModelo.create(datosProducto);
  }

  // Se listan productos con filtro opcional.
  async listar(opciones = {}) {
    const filtro = opciones.filtro || {};
    const consulta = ProductoModelo.find(filtro);

    if (opciones.lean) {
      consulta.lean();
    }

    return consulta;
  }

  // Se busca un producto por id.
  async buscarPorId(id, opciones = {}) {
    const consulta = ProductoModelo.findById(id);

    if (opciones.lean) {
      consulta.lean();
    }

    return consulta;
  }

  // Se busca un producto por codigo unico.
  async buscarPorCodigo(codigo) {
    return ProductoModelo.findOne({ code: codigo });
  }

  // Se actualiza un producto por identificador.
  async actualizarPorId(id, datosActualizacion, opciones = {}) {
    const consulta = ProductoModelo.findByIdAndUpdate(id, datosActualizacion, {
      new: true,
      runValidators: true
    });

    if (opciones.lean) {
      consulta.lean();
    }

    return consulta;
  }

  // Se elimina un producto por id.
  async eliminarPorId(id) {
    return ProductoModelo.findByIdAndDelete(id);
  }
}

module.exports = { ProductoDaoMongo };
