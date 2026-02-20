// Se implementa el modulo entorno del servidor de ecommerce.
const dotenv = require('dotenv');

dotenv.config();

const obtenerBooleano = (valor, valorPorDefecto = false) => {
  if (typeof valor === 'undefined') {
    return valorPorDefecto;
  }

  return String(valor).toLowerCase() === 'true';
};

module.exports = {
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/ecommerce',
  jwtSecreto: process.env.JWT_SECRETO || 'secreto_pruebas',
  jwtExpiracion: process.env.JWT_EXPIRACION || '1h',
  puerto: Number(process.env.PORT) || 8080,
  entorno: process.env.NODE_ENV || 'development',
  urlBaseApi: process.env.URL_BASE_API || 'http://localhost:8080',
  urlBaseCliente: process.env.URL_BASE_CLIENTE || 'http://localhost:8080',
  tokenRecuperacionMinutos: Number(process.env.TOKEN_RECUPERACION_MINUTOS) || 60,
  permitirRegistroAdmin: obtenerBooleano(process.env.PERMITIR_REGISTRO_ADMIN, false),
  modoMail: process.env.MODO_MAIL || 'logger',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPuerto: Number(process.env.SMTP_PORT) || 587,
  smtpSeguro: obtenerBooleano(process.env.SMTP_SEGURO, false),
  smtpUsuario: process.env.SMTP_USUARIO || '',
  smtpClave: process.env.SMTP_CLAVE || '',
  emailRemitente: process.env.EMAIL_REMITENTE || 'no-responder@ecommerce.local'
};
