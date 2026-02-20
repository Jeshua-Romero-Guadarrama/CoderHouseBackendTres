const mongoose = require('mongoose');
const { mongoUrl } = require('./entorno');

const conectarBaseDatos = async () => {
  try {
    // Se establece la conexion con MongoDB usando la URL configurada.
    await mongoose.connect(mongoUrl);
    console.log('Base de datos conectada');
  } catch (error) {
    // Se registra el error y se detiene el proceso si falla la conexion.
    console.error('Error al conectar base de datos:', error.message);
    process.exit(1);
  }
};

module.exports = { conectarBaseDatos };
