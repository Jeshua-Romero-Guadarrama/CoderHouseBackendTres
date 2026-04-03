// Se implementa el modulo usuario dto del servidor de ecommerce.
const crearUsuarioDTO = (usuario) => {
  if (!usuario) {
    return null;
  }

  return {
    id: usuario._id?.toString() || usuario.id,
    first_name: usuario.first_name,
    last_name: usuario.last_name,
    email: usuario.email,
    age: usuario.age,
    role: usuario.role,
    cart: usuario.cart?._id?.toString() || usuario.cart || null,
    createdAt: usuario.createdAt,
    updatedAt: usuario.updatedAt
  };
};

module.exports = { crearUsuarioDTO };
