// Se implementa el modulo passport del servidor de ecommerce.
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const { jwtSecreto } = require('./entorno');
const { usuariosServicio } = require('../servicios/usuarios.servicio');
const { autenticacionServicio } = require('../servicios/autenticacion.servicio');
const { ErrorAplicacion } = require('../utils/error-aplicacion');

const inicializarPassport = () => {
  passport.use(
    'registro',
    new LocalStrategy(
      { usernameField: 'email', passReqToCallback: true },
      async (solicitud, _, __, done) => {
        try {
          const usuarioCreado = await usuariosServicio.registrarUsuario(solicitud.body, {
            permitirRolAdmin: false
          });
          return done(null, usuarioCreado);
        } catch (error) {
          if (error instanceof ErrorAplicacion) {
            return done(null, false, { message: error.message });
          }

          return done(error);
        }
      }
    )
  );

  passport.use(
    'login',
    new LocalStrategy({ usernameField: 'email' }, async (correo, contrasena, done) => {
      try {
        const usuario = await autenticacionServicio.autenticarCredenciales(correo, contrasena);
        if (!usuario) {
          return done(null, false, { message: 'Credenciales invalidas' });
        }

        return done(null, usuario);
      } catch (error) {
        return done(error);
      }
    })
  );

  const opcionesJwt = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecreto
  };

  passport.use(
    'current',
    new JwtStrategy(opcionesJwt, async (cargaToken, done) => {
      try {
        const usuario = await autenticacionServicio.obtenerUsuarioActual(cargaToken.id);
        return done(null, usuario);
      } catch (error) {
        if (error instanceof ErrorAplicacion) {
          return done(null, false, { message: error.message });
        }

        return done(error);
      }
    })
  );
};

module.exports = { inicializarPassport };
