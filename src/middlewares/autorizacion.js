// Se implementa el modulo autorizacion del servidor de ecommerce.
const autorizarRoles = (rolesPermitidos) => (solicitud, respuesta, siguiente) => {
  if (!solicitud.usuario) {
    return respuesta.status(401).json({ estado: 'error', mensaje: 'No autenticado' });
  }

  if (!rolesPermitidos.includes(solicitud.usuario.role)) {
    return respuesta.status(403).json({ estado: 'error', mensaje: 'Sin permisos' });
  }

  return siguiente();
};

const autorizarUsuarioOAdmin = (solicitud, respuesta, siguiente) => {
  if (!solicitud.usuario) {
    return respuesta.status(401).json({ estado: 'error', mensaje: 'No autenticado' });
  }

  const esAdmin = solicitud.usuario.role === 'admin';
  const esMismoUsuario =
    solicitud.usuario._id && solicitud.usuario._id.toString() === solicitud.params.id;

  if (!esAdmin && !esMismoUsuario) {
    return respuesta.status(403).json({ estado: 'error', mensaje: 'Sin permisos' });
  }

  return siguiente();
};

const autorizarCarritoPropio = (solicitud, respuesta, siguiente) => {
  if (!solicitud.usuario) {
    return respuesta.status(401).json({ estado: 'error', mensaje: 'No autenticado' });
  }

  const idCarritoToken = solicitud.usuario.cart?._id?.toString() || solicitud.usuario.cart?.toString();
  const idCarritoRuta = solicitud.params.cid?.toString();

  if (!idCarritoToken || idCarritoToken !== idCarritoRuta) {
    return respuesta.status(403).json({
      estado: 'error',
      mensaje: 'Solo puedes operar sobre tu propio carrito'
    });
  }

  return siguiente();
};

module.exports = { autorizarRoles, autorizarUsuarioOAdmin, autorizarCarritoPropio };
