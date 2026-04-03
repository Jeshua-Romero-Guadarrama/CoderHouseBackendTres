// Se implementa el modulo ticket model del servidor de ecommerce.
const mongoose = require('mongoose');

const ticketEsquema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    purchase_datetime: { type: Date, default: Date.now },
    amount: { type: Number, required: true, min: 0 },
    purchaser: { type: String, required: true, trim: true, lowercase: true },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Carts', required: true },
    productos: [
      {
        producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
        titulo: { type: String, required: true },
        cantidad: { type: Number, required: true, min: 1 },
        precio_unitario: { type: Number, required: true, min: 0 },
        subtotal: { type: Number, required: true, min: 0 }
      }
    ],
    productos_sin_stock: [
      {
        producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
        solicitado: { type: Number, required: true, min: 1 },
        disponible: { type: Number, required: true, min: 0 }
      }
    ],
    estado: { type: String, enum: ['completa', 'incompleta'], required: true }
  },
  { timestamps: true }
);

const TicketModelo = mongoose.model('Tickets', ticketEsquema);

module.exports = { TicketModelo };
