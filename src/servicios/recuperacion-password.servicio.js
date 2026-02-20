const { compararHash } = require('../utils/seguridad');
const { crearTokenPlano, crearHashToken } = require('../utils/token-recuperacion');
const { ErrorAplicacion } = require('../utils/error-aplicacion');
const { usuariosServicio } = require('./usuarios.servicio');
const { tokenRecuperacionRepositorio } = require('../repositorios/token-recuperacion.repositorio');
const { correoServicio } = require('./correo.servicio');
const {
  tokenRecuperacionMinutos,
  urlBaseApi,
  urlBaseCliente,
  entorno,
  modoMail
} = require('../configuracion/entorno');

const limpiarUrlBase = (url) => String(url).replace(/\/+$/, '');

class RecuperacionPasswordServicio {
  constructor({
    usuarios = usuariosServicio,
    tokenRepo = tokenRecuperacionRepositorio,
    correo = correoServicio
  } = {}) {
    this.usuarios = usuarios;
    this.tokenRepo = tokenRepo;
    this.correo = correo;
  }

  construirPlantillaCorreo(enlaceCliente, enlaceApi) {
    // Se construye una plantilla HTML simple con boton y enlace directo.
    return `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #1f2937;">Recuperacion de contrasena</h2>
        <p>Recibimos una solicitud para restablecer tu contrasena.</p>
        <p>
          <a href="${enlaceCliente}" style="display: inline-block; padding: 12px 18px; border-radius: 8px; background: #2563eb; color: #ffffff; text-decoration: none;">
            Restablecer contrasena
          </a>
        </p>
        <p>Si el boton no funciona, utiliza este enlace:</p>
        <p><a href="${enlaceApi}">${enlaceApi}</a></p>
        <p>Este enlace expirara en ${tokenRecuperacionMinutos} minutos.</p>
      </div>
    `;
  }

  async solicitarRecuperacion(correo) {
    // Se inicia recuperacion sin revelar si el correo existe o no.
    if (!correo) {
      throw new ErrorAplicacion('Debes enviar un email valido', 400, 'EMAIL_INVALIDO');
    }

    const usuario = await this.usuarios.buscarUsuarioAutenticacionPorCorreo(correo);
    if (!usuario) {
      return {
        mensaje:
          'Si el email existe en el sistema, se enviara un enlace para restablecer la contrasena.'
      };
    }

    await this.tokenRepo.invalidarTokensActivosDeUsuario(usuario._id);

    // Se genera token de un solo uso con expiracion configurable.
    const tokenPlano = crearTokenPlano();
    const tokenHash = crearHashToken(tokenPlano);
    const expiracion = new Date(Date.now() + tokenRecuperacionMinutos * 60 * 1000);

    await this.tokenRepo.crear({
      usuario: usuario._id,
      token_hash: tokenHash,
      expira_en: expiracion
    });

    const baseCliente = limpiarUrlBase(urlBaseCliente);
    const baseApi = limpiarUrlBase(urlBaseApi);
    const enlaceCliente = `${baseCliente}/restablecer-password?token=${tokenPlano}`;
    const enlaceApi = `${baseApi}/api/sessions/restablecer-password-form?token=${tokenPlano}`;

    await this.correo.enviarCorreo({
      // Se envia correo de recuperacion segun el modo configurado.
      para: usuario.email,
      asunto: 'Recuperacion de contrasena - Ecommerce',
      html: this.construirPlantillaCorreo(enlaceCliente, enlaceApi)
    });

    const respuesta = {
      mensaje:
        'Si el email existe en el sistema, se enviara un enlace para restablecer la contrasena.'
    };

    // Se expone el enlace solo en desarrollo para facilitar pruebas manuales.
    if (entorno !== 'production' && modoMail === 'logger') {
      respuesta.enlace_recuperacion_debug = enlaceApi;
      respuesta.token_recuperacion_debug = tokenPlano;
    }

    return respuesta;
  }

  async restablecerPassword(tokenPlano, nuevaContrasena) {
    // Se valida token vigente y se actualiza la contrasena del usuario.
    if (!tokenPlano || !nuevaContrasena) {
      throw new ErrorAplicacion(
        'Debes enviar token y nueva contrasena',
        400,
        'DATOS_INCOMPLETOS'
      );
    }

    const tokenHash = crearHashToken(tokenPlano);
    const registroToken = await this.tokenRepo.buscarTokenValido(tokenHash);
    if (!registroToken) {
      throw new ErrorAplicacion(
        'El enlace de recuperacion es invalido o ha expirado',
        400,
        'TOKEN_RECUPERACION_INVALIDO'
      );
    }

    const usuario = await this.usuarios.buscarUsuarioCompletoPorId(registroToken.usuario);
    if (!usuario) {
      throw new ErrorAplicacion('Usuario no encontrado', 404, 'USUARIO_NO_ENCONTRADO');
    }

    const esMismaContrasena = compararHash(nuevaContrasena, usuario.password);
    if (esMismaContrasena) {
      // Se impide reutilizar la misma contrasena anterior.
      throw new ErrorAplicacion(
        'La nueva contrasena no puede ser igual a la anterior',
        400,
        'MISMA_CONTRASENA'
      );
    }

    await this.usuarios.actualizarUsuario(usuario._id, { password: nuevaContrasena });
    await this.tokenRepo.marcarComoUsado(registroToken._id);
    await this.tokenRepo.invalidarTokensActivosDeUsuario(usuario._id);

    return { mensaje: 'Contrasena restablecida correctamente' };
  }
}

const recuperacionPasswordServicio = new RecuperacionPasswordServicio();

module.exports = { RecuperacionPasswordServicio, recuperacionPasswordServicio };
