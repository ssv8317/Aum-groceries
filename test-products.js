#!/usr/bin/env node

// Product Testing Automation Script
// This script tests the product API endpoints and functionality

const API_BASE = 'http://localhost:8001';

async function testProductAPI() {
    console.log('🧪 Starting Product API Testing...\n');
    
    try {
        // Test 1: Get all products
        console.log('1️⃣ Testing GET /products...');
        const productsResponse = await fetch(`${API_BASE}/products`);
        const products = await productsResponse.json();
        console.log(`   ✅ Found ${products.length} products`);
        console.log(`   💰 Price range: $${Math.min(...products.map(p => p.price))} - $${Math.max(...products.map(p => p.price))}`);
        console.log(`   📦 Stock range: ${Math.min(...products.map(p => p.stock_quantity))} - ${Math.max(...products.map(p => p.stock_quantity))} units\n`);
        
        // Test 2: Get all categories
        console.log('2️⃣ Testing GET /categories...');
        const categoriesResponse = await fetch(`${API_BASE}/categories`);
        const categories = await categoriesResponse.json();
        console.log(`   ✅ Found ${categories.length} categories:`);
        categories.forEach(cat => console.log(`      - ${cat.name} (ID: ${cat.id})`));
        console.log('');
        
        // Test 3: Get specific product
        console.log('3️⃣ Testing GET /products/:id...');
        const productResponse = await fetch(`${API_BASE}/products/1`);
        const product = await productResponse.json();
        console.log(`   ✅ Product: ${product.name}`);
        console.log(`   💰 Price: $${product.price}`);
        console.log(`   📦 Stock: ${product.stock_quantity}`);
        console.log(`   🏷️ Category: ${product.category.name}\n`);
        
        // Test 4: Category filtering
        console.log('4️⃣ Testing category filtering...');
        const chipProducts = products.filter(p => p.category.name === 'Chips');
        console.log(`   ✅ Chips category has ${chipProducts.length} products`);
        
        const cookieProducts = products.filter(p => p.category.name === 'Cookies');
        console.log(`   ✅ Cookies category has ${cookieProducts.length} products`);
        
        const teaRuskProducts = products.filter(p => p.category.name === 'Tea Rusk');
        console.log(`   ✅ Tea Rusk category has ${teaRuskProducts.length} products\n`);
        
        // Test 5: Price filtering
        console.log('5️⃣ Testing price filtering...');
        const under5Products = products.filter(p => p.price < 5);
        console.log(`   ✅ Under $5: ${under5Products.length} products`);
        
        const between5and15Products = products.filter(p => p.price >= 5 && p.price <= 15);
        console.log(`   ✅ $5-$15 range: ${between5and15Products.length} products`);
        
        const above15Products = products.filter(p => p.price > 15);
        console.log(`   ✅ Above $15: ${above15Products.length} products\n`);
        
        // Test 6: Stock filtering
        console.log('6️⃣ Testing stock filtering...');
        const inStockProducts = products.filter(p => p.stock_quantity > 0);
        console.log(`   ✅ In stock: ${inStockProducts.length} products`);
        
        const outOfStockProducts = products.filter(p => p.stock_quantity === 0);
        console.log(`   ✅ Out of stock: ${outOfStockProducts.length} products\n`);
        
        // Test 7: Sorting tests
        console.log('7️⃣ Testing sorting logic...');
        const sortedByPriceAsc = [...products].sort((a, b) => a.price - b.price);
        console.log(`   ✅ Price (Low to High): ${sortedByPriceAsc[0].name} ($${sortedByPriceAsc[0].price}) → ${sortedByPriceAsc[sortedByPriceAsc.length-1].name} ($${sortedByPriceAsc[sortedByPriceAsc.length-1].price})`);
        
        const sortedByPriceDesc = [...products].sort((a, b) => b.price - a.price);
        console.log(`   ✅ Price (High to Low): ${sortedByPriceDesc[0].name} ($${sortedByPriceDesc[0].price}) → ${sortedByPriceDesc[sortedByPriceDesc.length-1].name} ($${sortedByPriceDesc[sortedByPriceDesc.length-1].price})`);
        
        const sortedByNameAsc = [...products].sort((a, b) => a.name.localeCompare(b.name));
        console.log(`   ✅ Name (A-Z): ${sortedByNameAsc[0].name} → ${sortedByNameAsc[sortedByNameAsc.length-1].name}\n`);
        
        // Test 8: Combined filters
        console.log('8️⃣ Testing combined filters...');
        const chipsUnder5InStock = products.filter(p => 
            p.category.name === 'Chips' && 
            p.price < 5 && 
            p.stock_quantity > 0
        );
        console.log(`   ✅ Chips + Under $5 + In Stock: ${chipsUnder5InStock.length} products\n`);
        
        console.log('🎉 All API tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Only run if this is the main module
if (require.main === module) {
    testProductAPI();
}

module.exports = { testProductAPI };
