const { TokenRecuperacionModelo } = require('../../modelos/token-recuperacion.model');

class TokenRecuperacionDaoMongo {
  // Se crea un registro de token para recuperacion de contrasena.
  async crear(datosToken) {
    return TokenRecuperacionModelo.create(datosToken);
  }

  // Se invalidan todos los tokens activos de un usuario.
  async invalidarTokensActivosDeUsuario(usuarioId) {
    return TokenRecuperacionModelo.updateMany(
      { usuario: usuarioId, usado: false },
      { $set: { usado: true, usado_en: new Date() } }
    );
  }

  // Se busca un token valido (no usado y no expirado).
  async buscarTokenValido(hashToken) {
    return TokenRecuperacionModelo.findOne({
      token_hash: hashToken,
      usado: false,
      expira_en: { $gt: new Date() }
    });
  }

  // Se marca un token como usado para evitar reutilizacion.
  async marcarComoUsado(tokenId) {
    return TokenRecuperacionModelo.findByIdAndUpdate(
      tokenId,
      { usado: true, usado_en: new Date() },
      { new: true }
    );
  }
}

module.exports = { TokenRecuperacionDaoMongo };
