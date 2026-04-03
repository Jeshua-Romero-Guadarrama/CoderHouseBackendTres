// Se implementa el modulo productos router del servidor de ecommerce.
const { Router } = require('express');
const {
  listarProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} = require('../controladores/productos.controlador');
const { autenticar } = require('../middlewares/passport');
const { autorizarRoles } = require('../middlewares/autorizacion');

const enrutador = Router();

enrutador.get('/', listarProductos);
enrutador.get('/:pid', obtenerProductoPorId);
enrutador.post('/', autenticar('current'), autorizarRoles(['admin']), crearProducto);
enrutador.put('/:pid', autenticar('current'), autorizarRoles(['admin']), actualizarProducto);
enrutador.delete('/:pid', autenticar('current'), autorizarRoles(['admin']), eliminarProducto);

module.exports = enrutador;
