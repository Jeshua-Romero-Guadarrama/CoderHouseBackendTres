// Se implementa el modulo carrito model del servidor de ecommerce.
const mongoose = require('mongoose');

const carritoEsquema = new mongoose.Schema(
  {
    productos: [
      {
        producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
        cantidad: { type: Number, min: 1, default: 1 }
      }
    ]
  },
  { timestamps: true }
);

const CarritoModelo = mongoose.model('Carts', carritoEsquema);

module.exports = { CarritoModelo };
