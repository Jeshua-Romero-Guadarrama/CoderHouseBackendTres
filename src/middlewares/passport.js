const passport = require('passport');

// Se centraliza la autenticacion para reutilizarla en rutas.
const autenticar = (estrategia, opciones = {}) => (solicitud, respuesta, siguiente) => {
  // Se delega la autenticacion a Passport y se expone el usuario en la solicitud.
  passport.authenticate(estrategia, { session: false }, (error, usuario, info) => {
    if (error) {
      // Se propaga el error para el handler global.
      return siguiente(error);
    }

    if (!usuario) {
      // Se responde con el codigo definido para el caso de no autenticado.
      const codigo = opciones.codigo || 401;
      return respuesta.status(codigo).json({
        estado: 'error',
        mensaje: info && info.message ? info.message : 'No autorizado'
      });
    }

    solicitud.usuario = usuario;
    return siguiente();
  })(solicitud, respuesta, siguiente);
};

module.exports = { autenticar };
