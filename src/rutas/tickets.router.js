// Se implementa el modulo tickets router del servidor de ecommerce.
const { Router } = require('express');
const { listarMisTickets } = require('../controladores/tickets.controlador');
const { autenticar } = require('../middlewares/passport');
const { autorizarRoles } = require('../middlewares/autorizacion');

const enrutador = Router();

enrutador.get('/mis-compras', autenticar('current'), autorizarRoles(['user']), listarMisTickets);

module.exports = enrutador;
