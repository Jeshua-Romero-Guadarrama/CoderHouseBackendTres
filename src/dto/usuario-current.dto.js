// Se implementa el modulo usuario-current dto del servidor de ecommerce.
const crearUsuarioActualDTO = (usuario) => {
  if (!usuario) {
    return null;
  }

  return {
    id: usuario._id?.toString() || usuario.id,
    nombre_completo: `${usuario.first_name} ${usuario.last_name}`.trim(),
    email: usuario.email,
    edad: usuario.age,
    rol: usuario.role,
    carrito_id: usuario.cart?._id?.toString() || usuario.cart || null
  };
};

module.exports = { crearUsuarioActualDTO };
