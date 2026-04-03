// Se implementa el modulo producto model del servidor de ecommerce.
const mongoose = require('mongoose');

const productoEsquema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, index: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    status: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const ProductoModelo = mongoose.model('Products', productoEsquema);

module.exports = { ProductoModelo };
