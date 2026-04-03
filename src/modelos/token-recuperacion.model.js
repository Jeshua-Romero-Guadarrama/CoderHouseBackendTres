// Se implementa el modulo token-recuperacion model del servidor de ecommerce.
const mongoose = require('mongoose');

const tokenRecuperacionEsquema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true, index: true },
    token_hash: { type: String, required: true, unique: true, index: true },
    expira_en: { type: Date, required: true, index: { expires: 0 } },
    usado: { type: Boolean, default: false },
    usado_en: { type: Date, default: null }
  },
  { timestamps: true }
);

const TokenRecuperacionModelo = mongoose.model('PasswordResetTokens', tokenRecuperacionEsquema);

module.exports = { TokenRecuperacionModelo };
