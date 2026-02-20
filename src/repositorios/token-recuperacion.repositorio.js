// Se implementa el modulo token-recuperacion repositorio del servidor de ecommerce.
const { TokenRecuperacionDaoMongo } = require('../dao/mongo/token-recuperacion.dao');

class TokenRecuperacionRepositorio {
  constructor(dao = new TokenRecuperacionDaoMongo()) {
    this.dao = dao;
  }

  crear(datosToken) {
    return this.dao.crear(datosToken);
  }

  invalidarTokensActivosDeUsuario(usuarioId) {
    return this.dao.invalidarTokensActivosDeUsuario(usuarioId);
  }

  buscarTokenValido(hashToken) {
    return this.dao.buscarTokenValido(hashToken);
  }

  marcarComoUsado(tokenId) {
    return this.dao.marcarComoUsado(tokenId);
  }
}

const tokenRecuperacionRepositorio = new TokenRecuperacionRepositorio();

module.exports = { TokenRecuperacionRepositorio, tokenRecuperacionRepositorio };
