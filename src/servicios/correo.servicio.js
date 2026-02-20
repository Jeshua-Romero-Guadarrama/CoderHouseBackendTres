// Se implementa el modulo correo servicio del servidor de ecommerce.
const { transporter, modoMail } = require('../configuracion/correo');
const { emailRemitente } = require('../configuracion/entorno');

class CorreoServicio {
  async enviarCorreo({ para, asunto, html }) {
    const info = await transporter.sendMail({
      from: emailRemitente,
      to: para,
      subject: asunto,
      html
    });

    if (modoMail !== 'smtp') {
      console.log('Correo simulado (jsonTransport):', info.message);
    }

    return info;
  }
}

const correoServicio = new CorreoServicio();

module.exports = { CorreoServicio, correoServicio };
