const crypto = require('crypto');

// Se genera un token aleatorio en texto plano para enviarlo por correo.
const crearTokenPlano = () => crypto.randomBytes(32).toString('hex');

// Se transforma el token plano en hash para almacenarlo de forma segura.
const crearHashToken = (tokenPlano) =>
  crypto.createHash('sha256').update(tokenPlano).digest('hex');

module.exports = { crearTokenPlano, crearHashToken };
