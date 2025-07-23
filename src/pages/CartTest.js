import React from 'react';
import { useCart } from '../contexts/CartContext';

const CartTest = () => {
  console.log('CartTest component rendering');
  
  try {
    const cartContext = useCart();
    console.log('Got cart context:', cartContext);
    
    const { items, totalItems } = cartContext;
    console.log('Items:', items, 'Total:', totalItems);
    
    return (
      <div style={{ padding: '20px' }}>
        <h1>Cart Test</h1>
        <p>Items: {JSON.stringify(items || [])}</p>
        <p>Total Items: {totalItems || 0}</p>
        <p>Items is array: {Array.isArray(items) ? 'YES' : 'NO'}</p>
        {items && items.length > 0 ? (
          <div>
            <h3>Cart Items:</h3>
            {items.map((item, index) => (
              <div key={item.id || index}>
                {item.name} - ${item.price} x {item.quantity}
              </div>
            ))}
          </div>
        ) : (
          <p>Cart is empty</p>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in CartTest:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Cart Test Error</h1>
        <p>Error: {error.message}</p>
      </div>
    );
  }
};

export default CartTest;
