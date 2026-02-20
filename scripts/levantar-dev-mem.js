const { spawn } = require('child_process');
const net = require('net');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo = null;
let servidor = null;

const cerrarRecursos = async () => {
  if (servidor && !servidor.killed) {
    servidor.kill();
  }

  if (mongo) {
    await mongo.stop();
  }
};

const verificarPuertoLibre = (puerto) =>
  new Promise((resolve) => {
    const servidorTemporal = net.createServer();
    servidorTemporal.once('error', () => resolve(false));
    servidorTemporal.once('listening', () => {
      servidorTemporal.close(() => resolve(true));
    });
    servidorTemporal.listen(puerto);
  });

const seleccionarPuerto = async (puertoBase) => {
  const maxIntentos = 20;
  for (let indice = 0; indice < maxIntentos; indice += 1) {
    const puerto = puertoBase + indice;
    // Se recorre un rango acotado para encontrar un puerto disponible.
    const libre = await verificarPuertoLibre(puerto);
    if (libre) {
      return puerto;
    }
  }

  throw new Error(`No se encontro un puerto libre entre ${puertoBase} y ${puertoBase + maxIntentos - 1}`);
};

const iniciar = async () => {
  // Se levanta una instancia temporal de MongoDB para desarrollo manual.
  mongo = await MongoMemoryServer.create({
    instance: { dbName: 'ecommerce_dev_mem' }
  });

  const puertoPreferido = Number(process.env.PORT || 8080);
  const puertoSeleccionado = await seleccionarPuerto(puertoPreferido);

  const entornoServidor = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: String(puertoSeleccionado),
    MONGO_URL: mongo.getUri(),
    JWT_SECRETO: process.env.JWT_SECRETO || 'desarrollo_super_secreto',
    JWT_EXPIRACION: process.env.JWT_EXPIRACION || '1h',
    TOKEN_RECUPERACION_MINUTOS: process.env.TOKEN_RECUPERACION_MINUTOS || '60',
    PERMITIR_REGISTRO_ADMIN: process.env.PERMITIR_REGISTRO_ADMIN || 'true',
    URL_BASE_API: process.env.URL_BASE_API || `http://localhost:${puertoSeleccionado}`,
    URL_BASE_CLIENTE: process.env.URL_BASE_CLIENTE || `http://localhost:${puertoSeleccionado}`,
    MODO_MAIL: process.env.MODO_MAIL || 'logger'
  };

  if (puertoSeleccionado !== puertoPreferido) {
    console.log(
      `El puerto ${puertoPreferido} estaba ocupado. Se inicia el servidor en el puerto ${puertoSeleccionado}.`
    );
  }

  // Se inicia el servidor principal usando la URL de Mongo en memoria.
  servidor = spawn('node', ['src/servidor.js'], {
    env: entornoServidor,
    stdio: 'inherit'
  });

  console.log(`Entorno dev:mem activo en http://localhost:${puertoSeleccionado}`);

  servidor.on('exit', async () => {
    await cerrarRecursos();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    await cerrarRecursos();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await cerrarRecursos();
    process.exit(0);
  });
};

iniciar().catch(async (error) => {
  console.error('No se pudo iniciar el entorno dev con Mongo en memoria:', error.message);
  await cerrarRecursos();
  process.exit(1);
});
