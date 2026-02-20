// Se implementa el modulo usuario model del servidor de ecommerce.
const mongoose = require('mongoose');

const usuarioEsquema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    age: { type: Number, required: true },
    password: { type: String, required: true },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Carts' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
  },
  { timestamps: true }
);

usuarioEsquema.set('toJSON', {
  transform: (_, retorno) => {
    delete retorno.password;
    delete retorno.__v;
    return retorno;
  }
});

const UsuarioModelo = mongoose.model('Users', usuarioEsquema);

module.exports = { UsuarioModelo };
