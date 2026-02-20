# CoderHouse Backend - Ecommerce Profesional

En el presente repositorio se implementa un servidor backend de ecommerce con arquitectura por capas, patron Repository, DAO/DTO, autorizacion por roles, recuperacion de contrasena por correo y logica de compra con tickets.

## Datos de entrega
- Estudiante: Jeshua Romero Guadarrama
- Curso/Comision: Backend - Comision 76950
- Proyecto: Ecommerce Backend Profesional

## Objetivo de la entrega
- Se profesionaliza el servidor con arquitectura escalable.
- Se aplica DAO, DTO y Repository.
- Se refuerza la seguridad por roles y autorizaciones.
- Se implementa mailing para recuperacion de contrasena.
- Se completa la logica de compra con control de stock y ticket.

## Arquitectura implementada

```txt
src/
  configuracion/       # Se centraliza entorno, db, passport y correo.
  modelos/             # Se definen esquemas mongoose.
  dao/mongo/           # Se resuelve el acceso directo a MongoDB.
  repositorios/        # Se encapsulan DAOs.
  servicios/           # Se implementa la logica de negocio.
  dto/                 # Se transfieren datos controlados entre capas.
  controladores/       # Se maneja la capa HTTP.
  rutas/               # Se declara el enrutamiento del API.
  middlewares/         # Se ejecutan auth, autorizacion y errores.
  utils/               # Se agrupan jwt, seguridad y utilidades.
scripts/
  probar-api-e2e.js    # Se valida la API completa en memoria.
  levantar-dev-mem.js  # Se levanta desarrollo sin Mongo local.
```

Flujo principal:

`Router -> Controller -> Service -> Repository -> DAO -> Model`

## Requisitos
- Node.js 18+
- npm

Opciones de base de datos:
- Opcion 1: MongoDB local instalado.
- Opcion 2: Mongo temporal en memoria con `npm run dev:mem`.

## Variables de entorno

Archivo requerido: `.env`

Archivo ejemplo: `.env.example`

Variables base:
- `NODE_ENV`
- `PORT`
- `MONGO_URL`
- `JWT_SECRETO`
- `JWT_EXPIRACION`

Variables de recuperacion:
- `TOKEN_RECUPERACION_MINUTOS`
- `URL_BASE_API`
- `URL_BASE_CLIENTE`

Variables de correo:
- `MODO_MAIL` (`logger` o `smtp`)
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SEGURO`
- `SMTP_USUARIO`
- `SMTP_CLAVE`
- `EMAIL_REMITENTE`

Variables de roles:
- `PERMITIR_REGISTRO_ADMIN`

## Scripts disponibles

```bash
npm install
npm start      # Se inicia el servidor con Mongo configurado en .env.
npm run dev    # Se inicia en modo watch.
npm run dev:mem
npm run test:e2e
```

Descripcion:
- `dev:mem`: Se levanta Mongo en memoria y luego se levanta el servidor.
- `test:e2e`: Se ejecuta validacion completa automatizada, y al final se apaga todo.

## Como correr todo en terminal (paso a paso)

### Opcion A: Ejecucion manual con Mongo local

Terminal 1:

```powershell
cd C:\Users\jeshu\Videos\GitHub\CoderHouseBackendTres
npm install
npm run dev
```

Terminal 2:

```powershell
$base = "http://localhost:8080"
Invoke-RestMethod -Method Get -Uri "$base/"
```

Si responde `API ecommerce activa`, el servidor queda listo para pruebas manuales.

### Opcion B: Ejecucion manual sin Mongo instalado

Terminal 1:

```powershell
cd C:\Users\jeshu\Videos\GitHub\CoderHouseBackendTres
npm install
npm run dev:mem
```

Notas:
- Si `8080` esta libre, se usa `http://localhost:8080`.
- Si `8080` esta ocupado, el script selecciona otro puerto libre y lo informa por consola.
- Se usa el puerto impreso por `Entorno dev:mem activo en http://localhost:<puerto>`.

Terminal 2:

```powershell
$base = "http://localhost:8080" # Se ajusta este valor segun la salida de dev:mem.
Invoke-RestMethod -Method Get -Uri "$base/"
```

### Opcion C: Validacion automatica completa (sin pasos manuales)

```powershell
cd C:\Users\jeshu\Videos\GitHub\CoderHouseBackendTres
npm run test:e2e
```

Resultado esperado:

```txt
OK_E2E: todas las pruebas API pasaron correctamente.
```

## Endpoints principales

Sesiones:
- `POST /api/sessions/registro`
- `POST /api/sessions/login`
- `GET /api/sessions/current`
- `POST /api/sessions/recuperar-password`
- `GET /api/sessions/restablecer-password-form?token=...`
- `POST /api/sessions/restablecer-password`

Usuarios:
- `GET /api/usuarios` (admin)
- `GET /api/usuarios/:id` (admin o mismo usuario)
- `POST /api/usuarios` (admin)
- `PUT /api/usuarios/:id` (admin o mismo usuario)
- `DELETE /api/usuarios/:id` (admin)

Productos:
- `GET /api/productos` (publico)
- `GET /api/productos/:pid` (publico)
- `POST /api/productos` (admin)
- `PUT /api/productos/:pid` (admin)
- `DELETE /api/productos/:pid` (admin)

Carritos:
- `GET /api/carritos/:cid` (user, carrito propio)
- `POST /api/carritos/:cid/productos/:pid` (user, carrito propio)
- `POST /api/carritos/:cid/compra` (user, carrito propio)

Tickets:
- `GET /api/tickets/mis-compras` (user)

## Guion de pruebas manual (PowerShell) por criterio

### 1) Preparacion

```powershell
$base = "http://localhost:8080" # Se ajusta al puerto activo.
Invoke-RestMethod -Method Get -Uri "$base/"
```

### 2) Registro y login admin

```powershell
$bodyAdmin = @{
  first_name = "Admin"
  last_name  = "Principal"
  email      = "admin@demo.com"
  age        = 30
  password   = "admin123"
  role       = "admin"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "$base/api/sessions/registro" -ContentType "application/json" -Body $bodyAdmin

$loginAdmin = @{ email = "admin@demo.com"; password = "admin123" } | ConvertTo-Json
$respAdmin = Invoke-RestMethod -Method Post -Uri "$base/api/sessions/login" -ContentType "application/json" -Body $loginAdmin
$tokenAdmin = $respAdmin.token
```

### 3) DTO seguro en `/current`

```powershell
Invoke-RestMethod -Method Get -Uri "$base/api/sessions/current" -Headers @{ Authorization = "Bearer $tokenAdmin" }
```

### 4) Creacion de producto por admin

```powershell
$bodyProducto = @{
  title       = "Mate de vidrio"
  description = "Mate templado premium"
  code        = "MAT-001"
  price       = 15000
  stock       = 5
  category    = "hogar"
  status      = $true
} | ConvertTo-Json

$prod = Invoke-RestMethod -Method Post -Uri "$base/api/productos" -ContentType "application/json" -Headers @{ Authorization = "Bearer $tokenAdmin" } -Body $bodyProducto
$productoId = $prod.producto.id
```

### 5) Registro y login user

```powershell
$bodyUser = @{
  first_name = "Lucia"
  last_name  = "Perez"
  email      = "user@demo.com"
  age        = 26
  password   = "user123"
  role       = "user"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "$base/api/sessions/registro" -ContentType "application/json" -Body $bodyUser

$loginUser = @{ email = "user@demo.com"; password = "user123" } | ConvertTo-Json
$respUser = Invoke-RestMethod -Method Post -Uri "$base/api/sessions/login" -ContentType "application/json" -Body $loginUser
$tokenUser = $respUser.token

$currentUser = Invoke-RestMethod -Method Get -Uri "$base/api/sessions/current" -Headers @{ Authorization = "Bearer $tokenUser" }
$carritoId = $currentUser.usuario.carrito_id
```

### 6) Validacion de autorizacion por roles

```powershell
try {
  Invoke-RestMethod -Method Post -Uri "$base/api/productos" -ContentType "application/json" -Headers @{ Authorization = "Bearer $tokenUser" } -Body $bodyProducto
} catch {
  $_.Exception.Response.StatusCode.value__
}
```

Resultado esperado: `403`

### 7) Agregado al carrito por user

```powershell
$bodyCarrito = @{ cantidad = 2 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$base/api/carritos/$carritoId/productos/$productoId" -ContentType "application/json" -Headers @{ Authorization = "Bearer $tokenUser" } -Body $bodyCarrito
```

### 8) Compra y ticket

```powershell
$compra = Invoke-RestMethod -Method Post -Uri "$base/api/carritos/$carritoId/compra" -ContentType "application/json" -Headers @{ Authorization = "Bearer $tokenUser" } -Body "{}"
$compra

Invoke-RestMethod -Method Get -Uri "$base/api/tickets/mis-compras" -Headers @{ Authorization = "Bearer $tokenUser" }
```

### 9) Recuperacion de contrasena

Se solicita recuperacion:

```powershell
$bodyRec = @{ email = "user@demo.com" } | ConvertTo-Json
$rec = Invoke-RestMethod -Method Post -Uri "$base/api/sessions/recuperar-password" -ContentType "application/json" -Body $bodyRec
$rec
```

En modo `logger` y entorno no productivo, la API devuelve:
- `enlace_recuperacion_debug`
- `token_recuperacion_debug`

Se usa ese token real (no se usa literal `TOKEN_AQUI`):

```powershell
$tokenReset = $rec.token_recuperacion_debug
```

Se prueba misma contrasena (debe fallar con `MISMA_CONTRASENA`):

```powershell
$bodyResetMisma = @{ token = $tokenReset; nuevaPassword = "user123" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$base/api/sessions/restablecer-password" -ContentType "application/json" -Body $bodyResetMisma
```

Se cambia a una nueva contrasena (debe funcionar):

```powershell
$bodyResetNueva = @{ token = $tokenReset; nuevaPassword = "user456" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$base/api/sessions/restablecer-password" -ContentType "application/json" -Body $bodyResetNueva
```

Se valida login final:

```powershell
$loginUserNueva = @{ email = "user@demo.com"; password = "user456" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$base/api/sessions/login" -ContentType "application/json" -Body $loginUserNueva
```

## Uso correcto de curl en PowerShell
 
Se recomienda usar `curl.exe` para sintaxis tipo Unix:

```powershell
curl.exe --% -X POST "http://localhost:8080/api/sessions/login" -H "Content-Type: application/json" -d "{\"email\":\"admin@demo.com\",\"password\":\"admin123\"}"
```

## Troubleshooting rapido

### Error `No es posible conectar con el servidor remoto`
- Se verifica que el servidor siga corriendo en otra terminal.
- Se valida puerto activo con `Invoke-RestMethod -Method Get -Uri "$base/"`.
- Si antes se ejecuto `npm run test:e2e`, se recuerda que ese flujo apaga el servidor al terminar.

### Error `EADDRINUSE: address already in use`
- Se interpreta que el puerto ya esta ocupado por otro proceso.
- Se usa el proceso ya activo en `8080`, o se cierra ese proceso.
- Con `npm run dev:mem`, el script ya elige otro puerto libre y lo informa.

Comandos utiles en PowerShell:

```powershell
Get-NetTCPConnection -LocalPort 8080 -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess
Get-Process -Id <PID>
Stop-Process -Id <PID> -Force
```

### Error `TOKEN_RECUPERACION_INVALIDO`
- Se confirma que se uso un token real, no el texto `TOKEN_AQUI`.
- Se solicita un token nuevo y se usa `token_recuperacion_debug` en desarrollo.
- Se confirma que el token no haya expirado ni sido usado previamente.

## Estado de validacion

Se ejecuta validacion automatica:

```bash
npm run test:e2e
```

Resultado actual esperado:

```txt
OK_E2E: todas las pruebas API pasaron correctamente.
```
