// Quick sorting test
console.log('=== Testing Sorting Logic ===');

// Simulate some test products
const testProducts = [
    { name: 'Apple', price: 2.50 },
    { name: 'Banana', price: 1.00 },
    { name: 'Cherry', price: 5.00 },
    { name: 'Date', price: 3.00 }
];

console.log('Original:', testProducts.map(p => `${p.name}: $${p.price}`));

// Test price ascending
const priceAsc = [...testProducts].sort((a, b) => a.price - b.price);
console.log('Price Asc:', priceAsc.map(p => `${p.name}: $${p.price}`));

// Test price descending  
const priceDesc = [...testProducts].sort((a, b) => b.price - a.price);
console.log('Price Desc:', priceDesc.map(p => `${p.name}: $${p.price}`));

// Test name ascending
const nameAsc = [...testProducts].sort((a, b) => a.name.localeCompare(b.name));
console.log('Name A-Z:', nameAsc.map(p => `${p.name}: $${p.price}`));
