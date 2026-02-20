const bcrypt = require('bcrypt');

// Se genera el hash de una contrasena con un salt seguro.
const crearHash = (contrasena) => bcrypt.hashSync(contrasena, bcrypt.genSaltSync(10));

// Se compara una contrasena plana contra su hash almacenado.
const compararHash = (contrasena, hashContrasena) => bcrypt.compareSync(contrasena, hashContrasena);

module.exports = { crearHash, compararHash };
