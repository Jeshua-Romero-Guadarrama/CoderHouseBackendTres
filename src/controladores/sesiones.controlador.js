const { crearToken } = require('../utils/jwt');
const { crearUsuarioDTO } = require('../dto/usuario.dto');
const { crearUsuarioActualDTO } = require('../dto/usuario-current.dto');
const { recuperacionPasswordServicio } = require('../servicios/recuperacion-password.servicio');

// Se registra un usuario y se responde un DTO sin datos sensibles.
const registrarUsuario = async (solicitud, respuesta) => {
  return respuesta.status(201).json({
    estado: 'success',
    mensaje: 'Usuario registrado correctamente',
    usuario: crearUsuarioDTO(solicitud.usuario)
  });
};

// Se autentica al usuario y se devuelve el JWT para sesiones protegidas.
const loginUsuario = async (solicitud, respuesta) => {
  const token = crearToken(solicitud.usuario);
  return respuesta.json({
    estado: 'success',
    mensaje: 'Login correcto',
    token,
    usuario: crearUsuarioActualDTO(solicitud.usuario)
  });
};

// Se obtiene el usuario actual asociado al token, en formato DTO.
const usuarioActual = async (solicitud, respuesta) => {
  return respuesta.json({
    estado: 'success',
    usuario: crearUsuarioActualDTO(solicitud.usuario)
  });
};

// Se inicia el flujo de recuperacion de contrasena por correo.
const solicitarRecuperacionPassword = async (solicitud, respuesta, siguiente) => {
  try {
    const { email } = solicitud.body;
    const resultado = await recuperacionPasswordServicio.solicitarRecuperacion(email);
    return respuesta.json({ estado: 'success', ...resultado });
  } catch (error) {
    return siguiente(error);
  }
};

// Se renderiza una vista minima para restablecer la contrasena.
const vistaRestablecerPassword = (solicitud, respuesta) => {
  const token = String(solicitud.query.token || '').replace(/[^a-zA-Z0-9]/g, '');

  return respuesta.type('html').send(`
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Restablecer contrasena</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 24px;">
        <h1>Restablecer contrasena</h1>
        <form method="post" action="/api/sessions/restablecer-password">
          <input type="hidden" name="token" value="${token}" />
          <label for="nuevaPassword">Nueva contrasena</label><br />
          <input id="nuevaPassword" type="password" name="nuevaPassword" required minlength="6" /><br /><br />
          <button type="submit">Restablecer</button>
        </form>
      </body>
    </html>
  `);
};

// Se restablece la contrasena validando token, expiracion y reglas de seguridad.
const restablecerPassword = async (solicitud, respuesta, siguiente) => {
  try {
    const token = solicitud.body.token || solicitud.query.token;
    const nuevaContrasena =
      solicitud.body.nuevaPassword ||
      solicitud.body.nueva_password ||
      solicitud.body.password ||
      null;

    const resultado = await recuperacionPasswordServicio.restablecerPassword(token, nuevaContrasena);
    return respuesta.json({ estado: 'success', ...resultado });
  } catch (error) {
    return siguiente(error);
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  usuarioActual,
  solicitarRecuperacionPassword,
  vistaRestablecerPassword,
  restablecerPassword
};
