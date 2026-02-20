const { spawn } = require('child_process');
const assert = require('assert');
const { MongoMemoryServer } = require('mongodb-memory-server');

const puerto = 8090;
const baseUrl = `http://localhost:${puerto}`;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const esperarServidorListo = async (url, timeoutMs = 30000) => {
  const inicio = Date.now();
  while (Date.now() - inicio < timeoutMs) {
    try {
      const respuesta = await fetch(url);
      if (respuesta.ok) {
        return;
      }
    } catch (_) {
      // Se reintenta hasta que el servidor este disponible.
    }
    await esperar(500);
  }
  throw new Error(`El servidor no respondio en ${timeoutMs}ms`);
};

const requestJson = async (metodo, url, cuerpo, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const respuesta = await fetch(url, {
    method: metodo,
    headers,
    body: typeof cuerpo === 'undefined' ? undefined : JSON.stringify(cuerpo)
  });

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch (_) {
    datos = null;
  }

  return { respuesta, datos };
};

const extraerUltimoTokenReset = (logsServidor) => {
  const regex = /restablecer-password-form\?token=([a-f0-9]{32,128})/g;
  let match;
  let ultimoToken = null;
  while ((match = regex.exec(logsServidor)) !== null) {
    ultimoToken = match[1];
  }
  return ultimoToken;
};

const terminarProceso = (proceso) =>
  new Promise((resolve) => {
    if (!proceso || proceso.killed) {
      resolve();
      return;
    }

    proceso.once('exit', () => resolve());
    proceso.kill();
    setTimeout(() => {
      if (!proceso.killed) {
        proceso.kill('SIGKILL');
      }
    }, 4000);
  });

const ejecutar = async () => {
  let mongo = null;
  let servidor = null;
  let logsServidor = '';

  try {
    mongo = await MongoMemoryServer.create({
      instance: { dbName: 'ecommerce_test' }
    });

    const entornoServidor = {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(puerto),
      MONGO_URL: mongo.getUri(),
      JWT_SECRETO: 'jwt_test_secreto',
      JWT_EXPIRACION: '1h',
      TOKEN_RECUPERACION_MINUTOS: '60',
      PERMITIR_REGISTRO_ADMIN: 'true',
      URL_BASE_API: baseUrl,
      URL_BASE_CLIENTE: baseUrl,
      MODO_MAIL: 'logger'
    };

    servidor = spawn('node', ['src/servidor.js'], {
      env: entornoServidor,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    servidor.stdout.on('data', (chunk) => {
      const texto = chunk.toString();
      logsServidor += texto;
    });

    servidor.stderr.on('data', (chunk) => {
      logsServidor += chunk.toString();
    });

    await esperarServidorListo(`${baseUrl}/`);

    const adminRegistro = await requestJson('POST', `${baseUrl}/api/sessions/registro`, {
      first_name: 'Admin',
      last_name: 'Principal',
      email: 'admin@test.com',
      age: 30,
      password: 'admin123',
      role: 'admin'
    });
    assert.strictEqual(adminRegistro.respuesta.status, 201, 'Fallo registro admin');

    const adminLogin = await requestJson('POST', `${baseUrl}/api/sessions/login`, {
      email: 'admin@test.com',
      password: 'admin123'
    });
    assert.strictEqual(adminLogin.respuesta.status, 200, 'Fallo login admin');
    const tokenAdmin = adminLogin.datos.token;
    assert.ok(tokenAdmin, 'No se obtuvo token admin');

    const currentAdmin = await requestJson('GET', `${baseUrl}/api/sessions/current`, undefined, tokenAdmin);
    assert.strictEqual(currentAdmin.respuesta.status, 200, 'Fallo /current admin');
    assert.ok(currentAdmin.datos.usuario.id, 'DTO current sin id');
    assert.ok(!Object.prototype.hasOwnProperty.call(currentAdmin.datos.usuario, 'password'), 'Se expuso password en /current');

    const crearProducto = await requestJson(
      'POST',
      `${baseUrl}/api/productos`,
      {
        title: 'Mate de vidrio',
        description: 'Mate templado premium',
        code: 'MAT-001',
        price: 15000,
        stock: 5,
        category: 'hogar',
        status: true
      },
      tokenAdmin
    );
    assert.strictEqual(crearProducto.respuesta.status, 201, 'Fallo creacion de producto por admin');
    const productoId = crearProducto.datos.producto.id;

    const userRegistro = await requestJson('POST', `${baseUrl}/api/sessions/registro`, {
      first_name: 'Lucia',
      last_name: 'Perez',
      email: 'user@test.com',
      age: 26,
      password: 'user123',
      role: 'user'
    });
    assert.strictEqual(userRegistro.respuesta.status, 201, 'Fallo registro user');

    const userLogin = await requestJson('POST', `${baseUrl}/api/sessions/login`, {
      email: 'user@test.com',
      password: 'user123'
    });
    assert.strictEqual(userLogin.respuesta.status, 200, 'Fallo login user');
    const tokenUser = userLogin.datos.token;
    assert.ok(tokenUser, 'No se obtuvo token user');

    const currentUser = await requestJson('GET', `${baseUrl}/api/sessions/current`, undefined, tokenUser);
    assert.strictEqual(currentUser.respuesta.status, 200, 'Fallo /current user');
    const carritoId = currentUser.datos.usuario.carrito_id;
    assert.ok(carritoId, 'Usuario sin carrito_id');

    const userNoPuedeCrearProducto = await requestJson(
      'POST',
      `${baseUrl}/api/productos`,
      {
        title: 'No permitido',
        description: 'No permitido',
        code: 'MAT-002',
        price: 1,
        stock: 1,
        category: 'test'
      },
      tokenUser
    );
    assert.strictEqual(
      userNoPuedeCrearProducto.respuesta.status,
      403,
      'Un user pudo crear producto'
    );

    const adminNoPuedeComprar = await requestJson(
      'POST',
      `${baseUrl}/api/carritos/${carritoId}/productos/${productoId}`,
      { cantidad: 1 },
      tokenAdmin
    );
    assert.strictEqual(adminNoPuedeComprar.respuesta.status, 403, 'Un admin pudo agregar al carrito de user');

    const agregarCarrito = await requestJson(
      'POST',
      `${baseUrl}/api/carritos/${carritoId}/productos/${productoId}`,
      { cantidad: 2 },
      tokenUser
    );
    assert.strictEqual(agregarCarrito.respuesta.status, 200, 'Fallo agregar producto al carrito');

    const compra = await requestJson(
      'POST',
      `${baseUrl}/api/carritos/${carritoId}/compra`,
      {},
      tokenUser
    );
    assert.strictEqual(compra.respuesta.status, 200, 'Fallo compra del carrito');
    assert.ok(compra.datos.ticket, 'No se genero ticket');
    assert.ok(['completa', 'incompleta'].includes(compra.datos.tipo_compra), 'Tipo de compra invalido');

    const ticketsUsuario = await requestJson(
      'GET',
      `${baseUrl}/api/tickets/mis-compras`,
      undefined,
      tokenUser
    );
    assert.strictEqual(ticketsUsuario.respuesta.status, 200, 'Fallo listado de tickets');
    assert.ok(Array.isArray(ticketsUsuario.datos.tickets), 'Tickets no es un arreglo');
    assert.ok(ticketsUsuario.datos.tickets.length >= 1, 'No hay tickets para el usuario');

    const solicitarRecuperacion = await requestJson(
      'POST',
      `${baseUrl}/api/sessions/recuperar-password`,
      { email: 'user@test.com' }
    );
    assert.strictEqual(
      solicitarRecuperacion.respuesta.status,
      200,
      'Fallo solicitud de recuperacion'
    );

    let tokenReset = null;
    for (let i = 0; i < 20; i += 1) {
      tokenReset = extraerUltimoTokenReset(logsServidor);
      if (tokenReset) {
        break;
      }
      await esperar(250);
    }
    assert.ok(tokenReset, 'No se pudo extraer token de recuperacion desde logs');

    const resetMismaContrasena = await requestJson(
      'POST',
      `${baseUrl}/api/sessions/restablecer-password`,
      { token: tokenReset, nuevaPassword: 'user123' }
    );
    assert.strictEqual(
      resetMismaContrasena.respuesta.status,
      400,
      'Se permitio reutilizar la misma contrasena'
    );

    const resetCorrecto = await requestJson(
      'POST',
      `${baseUrl}/api/sessions/restablecer-password`,
      { token: tokenReset, nuevaPassword: 'user456' }
    );
    assert.strictEqual(resetCorrecto.respuesta.status, 200, 'Fallo reset de contrasena');

    const loginConPasswordVieja = await requestJson('POST', `${baseUrl}/api/sessions/login`, {
      email: 'user@test.com',
      password: 'user123'
    });
    assert.strictEqual(
      loginConPasswordVieja.respuesta.status,
      401,
      'La contrasena vieja sigue siendo valida'
    );

    const loginConPasswordNueva = await requestJson('POST', `${baseUrl}/api/sessions/login`, {
      email: 'user@test.com',
      password: 'user456'
    });
    assert.strictEqual(loginConPasswordNueva.respuesta.status, 200, 'La contrasena nueva no funciona');

    console.log('OK_E2E: todas las pruebas API pasaron correctamente.');
  } finally {
    await terminarProceso(servidor);
    if (mongo) {
      await mongo.stop();
    }
  }
};

ejecutar().catch((error) => {
  console.error('ERROR_E2E:', error.message);
  process.exitCode = 1;
});
