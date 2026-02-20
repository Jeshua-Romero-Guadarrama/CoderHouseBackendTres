// Se implementa el modulo usuarios router del servidor de ecommerce.
const { Router } = require('express');
const {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} = require('../controladores/usuarios.controlador');
const { autenticar } = require('../middlewares/passport');
const { autorizarRoles, autorizarUsuarioOAdmin } = require('../middlewares/autorizacion');

const enrutador = Router();

enrutador.get('/', autenticar('current'), autorizarRoles(['admin']), obtenerUsuarios);
enrutador.get('/:id', autenticar('current'), autorizarUsuarioOAdmin, obtenerUsuarioPorId);
enrutador.post('/', autenticar('current'), autorizarRoles(['admin']), crearUsuario);
enrutador.put('/:id', autenticar('current'), autorizarUsuarioOAdmin, actualizarUsuario);
enrutador.delete('/:id', autenticar('current'), autorizarRoles(['admin']), eliminarUsuario);

module.exports = enrutador;
