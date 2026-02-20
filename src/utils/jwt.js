const jwt = require('jsonwebtoken');
const { jwtSecreto, jwtExpiracion } = require('../configuracion/entorno');

// Se crea un token JWT con los datos minimos de sesion.
const crearToken = (usuario) => {
  const cargaToken = {
    id: usuario._id,
    email: usuario.email,
    role: usuario.role
  };

  return jwt.sign(cargaToken, jwtSecreto, { expiresIn: jwtExpiracion });
};

module.exports = { crearToken };
