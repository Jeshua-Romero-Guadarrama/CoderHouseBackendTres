// Se implementa el modulo manejo-errores del servidor de ecommerce.
const { ErrorAplicacion } = require('../utils/error-aplicacion');

const manejarRutaNoEncontrada = (solicitud, respuesta) => {
  return respuesta.status(404).json({
    estado: 'error',
    mensaje: `Ruta no encontrada: ${solicitud.method} ${solicitud.originalUrl}`
  });
};

const manejarErrores = (error, solicitud, respuesta, siguiente) => {
  if (respuesta.headersSent) {
    return siguiente(error);
  }

  if (error instanceof ErrorAplicacion) {
    return respuesta.status(error.codigoEstado).json({
      estado: 'error',
      codigo: error.codigo,
      mensaje: error.message
    });
  }

  if (error?.name === 'ValidationError') {
    return respuesta.status(400).json({
      estado: 'error',
      codigo: 'VALIDACION',
      mensaje: error.message
    });
  }

  if (error?.code === 11000) {
    return respuesta.status(409).json({
      estado: 'error',
      codigo: 'DUPLICADO',
      mensaje: 'El recurso que intentas crear ya existe'
    });
  }

  console.error(error);
  return respuesta.status(500).json({
    estado: 'error',
    codigo: 'ERROR_INTERNO',
    mensaje: 'Error interno del servidor'
  });
};

module.exports = { manejarErrores, manejarRutaNoEncontrada };
