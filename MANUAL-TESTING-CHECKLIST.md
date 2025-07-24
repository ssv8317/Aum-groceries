# 🧪 MANUAL FRONTEND TESTING CHECKLIST

## Pre-Test Setup ✅
- [x] All services running (frontend, product-service, databases)
- [x] 57 products in database (including 2 test products)
- [x] 16 categories available
- [x] Test data includes edge cases (high price, zero stock)
- [x] Browser console open for debugging

## Test Execution Instructions

### 🔗 **STEP 1: Open Products Page**
1. Navigate to: http://localhost:3002/products
2. **Expected**: Page loads without errors, shows all 57 products
3. **Check Console**: Should see "Applying filters:" logs
4. **Visual Check**: Product grid displays properly

**✅ RESULT**: _____________

---

### 🏷️ **STEP 2: Test Category Filter**
1. **Test "All Categories"** (default)
   - Expected: Shows all 57 products
   - Console: "Original products count: 57"

2. **Test "Chips" Category**
   - Select "Chips" from dropdown
   - Expected: Shows 10 products (9 original + 1 test)
   - Console: Should log filtering process

3. **Test "Cookies" Category**
   - Select "Cookies" from dropdown  
   - Expected: Shows 3 products (2 original + 1 test)

4. **Test "Tea Rusk" Category**
   - Select "Tea Rusk" from dropdown
   - Expected: Shows 11 products

**✅ RESULTS**:
- All Categories: _____________
- Chips: _____________
- Cookies: _____________
- Tea Rusk: _____________

---

### 💰 **STEP 3: Test Price Range Filter**
1. **Test "All Prices"** (default)
   - Expected: Shows all 57 products

2. **Test "Under ₹50"**
   - Expected: Shows ~54 products (excludes Test High Price Product)
   - Console: "Price filter - min: 0 max: 50"

3. **Test "₹50 - ₹100"**
   - Expected: Shows Test High Price Product ($99.99)
   - Console: Price filtering logs

4. **Test "Above ₹500"**
   - Expected: Shows 0 products
   - Console: "After price filter: 0"

**✅ RESULTS**:
- All Prices: _____________
- Under ₹50: _____________
- ₹50-₹100: _____________
- Above ₹500: _____________

---

### 📦 **STEP 4: Test Stock Filter**
1. **Uncheck "Show only items in stock"**
   - Expected: Shows all 57 products (including out-of-stock)

2. **Check "Show only items in stock"**
   - Expected: Shows 56 products (excludes Test High Price Product with 0 stock)
   - Console: "After stock filter: 56"

**✅ RESULTS**:
- All Items: _____________
- In Stock Only: _____________

---

### 🔄 **STEP 5: Test Sorting**
1. **Test "Featured" (default)**
   - Expected: Original API order
   - Console: "Applying sort: featured" or default

2. **Test "Price: Low to High"**
   - Expected: Cheapest first (Britannia/Maggi $0.99 products at top)
   - Console: "Applying sort: price-asc"

3. **Test "Price: High to Low"**
   - Expected: Most expensive first (Test High Price Product $99.99 at top)
   - Console: "Applying sort: price-desc"

4. **Test "A-Z"**
   - Expected: Alphabetical (Amul products should be first)
   - Console: "Applying sort: name-asc"

5. **Test "Newest First"**
   - Expected: Test products created today should be first
   - Console: "Applying sort: newest"

**✅ RESULTS**:
- Featured: _____________
- Price Low-High: _____________
- Price High-Low: _____________
- A-Z: _____________
- Newest: _____________

---

### 🔗 **STEP 6: Test Combined Filters**
1. **Chips + Under ₹50**
   - Select Category: "Chips" + Price: "Under ₹50"
   - Expected: 9 products (excludes expensive test product)

2. **Cookies + In Stock Only**
   - Select Category: "Cookies" + Check "In Stock Only"
   - Expected: All 3 cookie products (all have stock > 0)

3. **Under ₹50 + In Stock + Sort by Price High-Low**
   - Price: "Under ₹50" + Stock: "In Stock Only" + Sort: "Price: High to Low"
   - Expected: Filtered products sorted by price descending

4. **Test Clear Filters**
   - Click "Clear all filters" button
   - Expected: Returns to showing all 57 products, all filters reset

**✅ RESULTS**:
- Chips + Under ₹50: _____________
- Cookies + In Stock: _____________
- Triple Filter + Sort: _____________
- Clear Filters: _____________

---

### 🖱️ **STEP 7: Test Product Detail Navigation**
1. **Click on first product card**
   - Expected: Navigates to `/products/:id` page
   - URL should change to specific product ID

2. **Check product detail page content**
   - Expected: Shows detailed product information
   - All product fields visible

3. **Test back navigation**
   - Expected: Returns to products list with filters preserved

**✅ RESULTS**:
- Navigation: _____________
- Detail Page: _____________
- Back Navigation: _____________

---

### 🚫 **STEP 8: Test Error Scenarios**
1. **Invalid product URL**
   - Navigate to: http://localhost:3002/products/999
   - Expected: Shows 404 or error page

2. **Test with empty results**
   - Set impossible filter combination
   - Expected: Shows "No products found" message

**✅ RESULTS**:
- Invalid URL: _____________
- Empty Results: _____________

---

### 📱 **STEP 9: Test Responsiveness**
1. **Resize browser window**
   - Test desktop, tablet, mobile sizes
   - Expected: Layout adapts properly

2. **Check mobile filters**
   - Expected: Filters remain usable on small screens

**✅ RESULTS**:
- Desktop: _____________
- Tablet: _____________
- Mobile: _____________

---

### 🐛 **STEP 10: Console Debugging Check**
1. **Monitor browser console throughout testing**
   - Expected: Detailed filter/sort logging
   - No JavaScript errors
   - Proper API call logging

2. **Check Network tab**
   - Expected: Clean API calls to product service
   - Proper response handling

**✅ RESULTS**:
- Console Logs: _____________
- Network Calls: _____________
- Error Handling: _____________

---

## 📊 FINAL TEST SUMMARY

### ✅ **PASSED TESTS**: ___/40
### ❌ **FAILED TESTS**: ___/40
### ⚠️ **ISSUES FOUND**: ___________

### 🎯 **OVERALL ASSESSMENT**: 
- **Functionality**: ⭐⭐⭐⭐⭐
- **Performance**: ⭐⭐⭐⭐⭐
- **User Experience**: ⭐⭐⭐⭐⭐
- **Error Handling**: ⭐⭐⭐⭐⭐

### 📝 **NOTES & RECOMMENDATIONS**:
_Add any observations, bugs found, or improvement suggestions..._
