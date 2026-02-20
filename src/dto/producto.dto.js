// Se implementa el modulo producto dto del servidor de ecommerce.
const crearProductoDTO = (producto) => {
  if (!producto) {
    return null;
  }

  return {
    id: producto._id?.toString() || producto.id,
    title: producto.title,
    description: producto.description,
    code: producto.code,
    price: producto.price,
    stock: producto.stock,
    category: producto.category,
    status: producto.status,
    createdAt: producto.createdAt,
    updatedAt: producto.updatedAt
  };
};

module.exports = { crearProductoDTO };
