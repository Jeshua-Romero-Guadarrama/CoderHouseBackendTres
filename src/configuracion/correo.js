// Se implementa el modulo correo del servidor de ecommerce.
const nodemailer = require('nodemailer');
const {
  modoMail,
  smtpHost,
  smtpPuerto,
  smtpSeguro,
  smtpUsuario,
  smtpClave
} = require('./entorno');

let transporter;

if (modoMail === 'smtp' && smtpHost) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPuerto,
    secure: smtpSeguro,
    auth: smtpUsuario ? { user: smtpUsuario, pass: smtpClave } : undefined
  });
} else {
  transporter = nodemailer.createTransport({ jsonTransport: true });
}

module.exports = { transporter, modoMail };
