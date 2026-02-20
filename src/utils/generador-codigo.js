// Se implementa el modulo generador-codigo del servidor de ecommerce.
const { randomBytes } = require('crypto');

const generarCodigoTicket = () => {
  const sufijo = randomBytes(4).toString('hex');
  return `TKT-${Date.now()}-${sufijo}`.toUpperCase();
};

module.exports = { generarCodigoTicket };
