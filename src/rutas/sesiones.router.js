// Se implementa el modulo sesiones router del servidor de ecommerce.
const { Router } = require('express');
const {
  registrarUsuario,
  loginUsuario,
  usuarioActual,
  solicitarRecuperacionPassword,
  vistaRestablecerPassword,
  restablecerPassword
} = require('../controladores/sesiones.controlador');
const { autenticar } = require('../middlewares/passport');

const enrutador = Router();

enrutador.post('/registro', autenticar('registro', { codigo: 400 }), registrarUsuario);
enrutador.post('/login', autenticar('login'), loginUsuario);
enrutador.get('/current', autenticar('current'), usuarioActual);
enrutador.post('/recuperar-password', solicitarRecuperacionPassword);
enrutador.get('/restablecer-password-form', vistaRestablecerPassword);
enrutador.post('/restablecer-password', restablecerPassword);

module.exports = enrutador;
