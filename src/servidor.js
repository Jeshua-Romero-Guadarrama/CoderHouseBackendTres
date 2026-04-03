// Se implementa el modulo servidor del servidor de ecommerce.
const express = require('express');
const passport = require('passport');

const { conectarBaseDatos } = require('./configuracion/db');
const { inicializarPassport } = require('./configuracion/passport');
const { puerto } = require('./configuracion/entorno');
const enrutadorUsuarios = require('./rutas/usuarios.router');
const enrutadorSesiones = require('./rutas/sesiones.router');
const enrutadorProductos = require('./rutas/productos.router');
const enrutadorCarritos = require('./rutas/carritos.router');
const enrutadorTickets = require('./rutas/tickets.router');
const { manejarErrores, manejarRutaNoEncontrada } = require('./middlewares/manejo-errores');

const aplicacion = express();

aplicacion.use(express.json());
aplicacion.use(express.urlencoded({ extended: true }));

inicializarPassport();
aplicacion.use(passport.initialize());

aplicacion.get('/', (solicitud, respuesta) => {
  return respuesta.json({ estado: 'ok', mensaje: 'API ecommerce activa' });
});

aplicacion.use('/api/usuarios', enrutadorUsuarios);
aplicacion.use('/api/sessions', enrutadorSesiones);
aplicacion.use('/api/productos', enrutadorProductos);
aplicacion.use('/api/carritos', enrutadorCarritos);
aplicacion.use('/api/tickets', enrutadorTickets);

aplicacion.use(manejarRutaNoEncontrada);
aplicacion.use(manejarErrores);

conectarBaseDatos().then(() => {
  aplicacion.listen(puerto, () => {
    console.log(`Servidor escuchando en puerto ${puerto}`);
  });
});
