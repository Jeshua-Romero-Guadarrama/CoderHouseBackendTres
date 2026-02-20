// Se implementa el modulo error-aplicacion del servidor de ecommerce.
class ErrorAplicacion extends Error {
  constructor(mensaje, codigoEstado = 400, codigo = 'ERROR_APLICACION') {
    super(mensaje);
    this.name = 'ErrorAplicacion';
    this.codigoEstado = codigoEstado;
    this.codigo = codigo;
  }
}

module.exports = { ErrorAplicacion };
