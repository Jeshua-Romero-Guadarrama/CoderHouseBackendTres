const { CarritoModelo } = require('../../modelos/carrito.model');

class CarritoDaoMongo {
  // Se crea un carrito inicial sin productos.
  async crearCarritoVacio() {
    return CarritoModelo.create({ productos: [] });
  }

  // Se busca un carrito por id con opcion de populate y lean.
  async buscarPorId(id, opciones = {}) {
    const consulta = CarritoModelo.findById(id);

    if (opciones.populate) {
      consulta.populate('productos.producto');
    }

    if (opciones.lean) {
      consulta.lean();
    }

    return consulta;
  }

  // Se actualiza un carrito por id con validaciones activas.
  async actualizarPorId(id, datosActualizacion, opciones = {}) {
    const consulta = CarritoModelo.findByIdAndUpdate(id, datosActualizacion, {
      new: true,
      runValidators: true
    });

    if (opciones.populate) {
      consulta.populate('productos.producto');
    }

    if (opciones.lean) {
      consulta.lean();
    }

    return consulta;
  }

  // Se reemplaza el arreglo completo de productos del carrito.
  async reemplazarProductos(id, productos, opciones = {}) {
    const consulta = CarritoModelo.findByIdAndUpdate(
      id,
      { productos },
      { new: true, runValidators: true }
    );

    if (opciones.populate) {
      consulta.populate('productos.producto');
    }

    if (opciones.lean) {
      consulta.lean();
    }

    return consulta;
  }

  // Se elimina un carrito por identificador.
  async eliminarPorId(id) {
    return CarritoModelo.findByIdAndDelete(id);
  }
}

module.exports = { CarritoDaoMongo };
