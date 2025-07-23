# 🧪 Testing Guide - Real-Time Features

This guide will help you test all the production-ready features of your AUM Groceries application.

## 🚀 Quick Start Testing

### 1. Pre-requisites Check
```bash
# Run the production check
npm run check
```

### 2. Start the Application
```bash
npm start
```

## 🔍 Feature Testing Checklist

### ✅ Authentication Flow
1. **Register a new user:**
   - Go to `/register`
   - Fill out the form
   - Verify JWT token is stored
   - Check that you're redirected to home page

2. **Login existing user:**
   - Go to `/login`
   - Enter credentials
   - Verify authentication state
   - Check token expiration handling

3. **Logout:**
   - Click logout
   - Verify cart is cleared
   - Check token is removed
   - Verify redirect to login

### ✅ Real-Time Cart Synchronization

#### Test 1: Single Device Cart Operations
1. **Add items to cart:**
   - Browse products (`/products`)
   - Add various items
   - Verify optimistic UI updates
   - Check real-time price calculations

2. **Update quantities:**
   - Go to cart page (`/cart`)
   - Increase/decrease quantities
   - Verify instant UI updates
   - Check backend synchronization

3. **Remove items:**
   - Remove items from cart
   - Verify immediate UI response
   - Check cart totals update

#### Test 2: Multi-Device Synchronization
1. **Setup:**
   - Open 2+ browser tabs/windows
   - Login with same account in all tabs
   - Navigate to different pages

2. **Cross-tab testing:**
   - Add item in Tab 1 → Check Tab 2 cart updates
   - Change quantity in Tab 2 → Check Tab 1 reflects change
   - Remove item in Tab 3 → Check all tabs sync

3. **Real-time notifications:**
   - Verify toast messages appear
   - Check WebSocket connection status indicator

### ✅ Offline/Online Handling

#### Test 3: Network Connectivity
1. **Go offline:**
   - Disconnect internet/disable WiFi
   - Try to add items to cart
   - Verify appropriate error messages
   - Check offline indicator appears

2. **Go back online:**
   - Reconnect internet
   - Verify automatic cart sync
   - Check WebSocket reconnection
   - Confirm all data is consistent

### ✅ Error Handling & Recovery

#### Test 4: Backend Service Failures
1. **Stop Order Service (Port 8002):**
   - Try cart operations
   - Verify graceful error handling
   - Check user-friendly error messages
   - Restart service and verify recovery

2. **Stop WebSocket Service (Port 8080):**
   - Verify fallback to HTTP polling
   - Check connection status indicator
   - Restart and verify reconnection

### ✅ Performance Testing

#### Test 5: Load & Performance
1. **Large cart operations:**
   - Add 20+ items to cart
   - Test scrolling performance
   - Verify quick calculations
   - Check memory usage

2. **Rapid interactions:**
   - Quickly add/remove multiple items
   - Test debouncing/throttling
   - Verify no race conditions
   - Check UI responsiveness

### ✅ Coupon System

#### Test 6: Discount Features
1. **Apply valid coupons:**
   - Use code: `SAVE10` (10% discount)
   - Use code: `WELCOME` ($5 off)
   - Verify discount calculations
   - Check real-time total updates

2. **Handle invalid coupons:**
   - Try invalid codes
   - Verify error messages
   - Check cart totals unchanged

### ✅ Order Flow

#### Test 7: Complete Purchase
1. **Checkout process:**
   - Navigate to checkout
   - Fill shipping information
   - Verify order totals
   - Complete order placement

2. **Order tracking:**
   - Check order appears in orders list
   - Verify real-time status updates
   - Test order detail page

## 🔧 Debug Tools

### Browser Developer Tools
1. **Network Tab:**
   - Monitor API calls
   - Check WebSocket connection
   - Verify response times

2. **Console:**
   - Watch for errors
   - Check WebSocket messages
   - Monitor state changes

3. **Application Tab:**
   - Check localStorage data
   - Verify JWT token storage
   - Monitor session data

### React Query DevTools
- Enable in development mode
- Monitor cache states
- Check query invalidations
- Verify optimistic updates

## 🐛 Common Issues & Solutions

### Issue 1: Cart not syncing
**Symptoms:** Cart changes don't appear in other tabs
**Solutions:**
- Check WebSocket connection status
- Verify user is authenticated
- Check browser console for errors
- Restart WebSocket service

### Issue 2: Slow performance
**Symptoms:** UI feels sluggish
**Solutions:**
- Check network tab for slow API calls
- Verify React Query cache settings
- Check for memory leaks
- Optimize component re-renders

### Issue 3: Authentication errors
**Symptoms:** Login issues or token problems
**Solutions:**
- Clear browser storage
- Check token expiration
- Verify User Service is running
- Check API interceptors

## 📊 Performance Benchmarks

### Expected Performance:
- **Page load time:** < 2 seconds
- **Cart operations:** < 500ms
- **Real-time sync:** < 100ms
- **WebSocket reconnection:** < 3 seconds

### Monitoring Commands:
```bash
# Check bundle size
npm run build
npx bundlesize

# Performance audit
npx lighthouse http://localhost:3000

# Network analysis
npm run analyze
```

## ✅ Production Readiness Checklist

- [ ] All backend services running
- [ ] WebSocket connections stable
- [ ] No mock data in use
- [ ] Error handling graceful
- [ ] Performance optimized
- [ ] Real-time sync working
- [ ] Offline handling functional
- [ ] Authentication secure
- [ ] Cart operations reliable
- [ ] Order flow complete

## 🎉 Success Criteria

Your application is production-ready when:

1. **All tests pass** without errors
2. **Real-time sync** works across devices
3. **Error handling** is graceful
4. **Performance** meets benchmarks
5. **User experience** is smooth
6. **Data consistency** is maintained

---

**Happy Testing!** 🚀

Your AUM Groceries application is now enterprise-grade with real-time capabilities!
