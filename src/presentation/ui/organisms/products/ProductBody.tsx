import ProductCard from '../../molecules/products/ProductCard';

const ProductBody = () => {
  // Datos simulados de productos
  const products = [
    {
      id: '1',
      image:
        'https://www.theboxcompany.com.my/wp-content/uploads/2022/07/Malaysia-Rectangular-Kraft-Box.jpg',
      name: 'Producto 1 de Producto',
      description: 'Descripción del producto 1',
      price: '10.00'
    },
    {
      id: '2',
      image:
        'https://www.theboxcompany.com.my/wp-content/uploads/2022/07/Malaysia-Rectangular-Kraft-Box.jpg',
      name: 'Producto 2',
      description: 'Descripción del producto 2',
      price: '20.00'
    },
    {
      id: '3',
      image:
        'https://www.theboxcompany.com.my/wp-content/uploads/2022/07/Malaysia-Rectangular-Kraft-Box.jpg',
      name: 'Producto 3',
      description: 'Descripción del producto 3',
      price: '30.00'
    }
  ];

  // Función para manejar la acción de agregar al carrito
  const handleAddToCart = (productId: string) => {
    console.log('Producto agregado al carrito:', productId);
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {products.map(product => (
        <ProductCard
          id={product.id}
          key={product.id}
          image={product.image}
          name={product.name}
          price={product.price}
          onAddToCart={() => handleAddToCart(product.id)}
        />
      ))}
    </div>
  );
};

export default ProductBody;
