// Se implementa el modulo carritos router del servidor de ecommerce.
const { Router } = require('express');
const {
  obtenerCarrito,
  agregarProductoAlCarrito,
  finalizarCompra
} = require('../controladores/carritos.controlador');
const { autenticar } = require('../middlewares/passport');
const { autorizarRoles, autorizarCarritoPropio } = require('../middlewares/autorizacion');

const enrutador = Router();

enrutador.get('/:cid', autenticar('current'), autorizarCarritoPropio, obtenerCarrito);
enrutador.post(
  '/:cid/productos/:pid',
  autenticar('current'),
  autorizarRoles(['user']),
  autorizarCarritoPropio,
  agregarProductoAlCarrito
);
enrutador.post(
  '/:cid/compra',
  autenticar('current'),
  autorizarRoles(['user']),
  autorizarCarritoPropio,
  finalizarCompra
);

module.exports = enrutador;
