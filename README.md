# AUM Groceries Customer Web App

A modern, responsive React.js web application for AUM Groceries customer portal.

## Features

✅ **Complete Customer Experience:**
- **User Authentication**: Login, Register, Logout with JWT
- **Product Browsing**: Search, filter, and view products
- **Shopping Cart**: Add/remove items, quantity management
- **Checkout Process**: Address selection, payment options, order placement
- **Order Management**: View orders, track delivery, order history
- **User Profile**: Manage account, addresses, change password

✅ **Technical Features:**
- Responsive design with Tailwind CSS
- Protected routes for authenticated users
- Context-based state management (Auth, Cart)
- Form validation with React Hook Form
- Toast notifications
- JWT token handling
- Local storage for cart persistence

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   └── ProtectedRoute.js
│   ├── Layout/
│   │   ├── Navbar.js
│   │   └── Footer.js
│   └── Products/
│       ├── ProductCard.js
│       ├── ProductFilters.js
│       └── ProductGrid.js
├── contexts/
│   ├── AuthContext.js
│   └── CartContext.js
├── pages/
│   ├── Auth/
│   │   ├── Login.js
│   │   └── Register.js
│   ├── Home.js
│   ├── Products.js
│   ├── ProductDetail.js
│   ├── Cart.js
│   ├── Checkout.js
│   ├── Orders.js
│   ├── OrderDetail.js
│   ├── OrderTracking.js
│   ├── Profile.js
│   └── NotFound.js
├── services/
│   ├── api.js
│   └── apiService.js
├── App.js
├── index.js
└── index.css
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:8080
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   The application will open at `http://localhost:3000`

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from create-react-app

## API Integration

The frontend expects a backend API running on `http://localhost:8080` with the following endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `PUT /auth/change-password` - Change password

### Products
- `GET /products` - Get all products (with filters)
- `GET /products/:id` - Get product details
- `GET /products/search` - Search products
- `GET /products/category/:category` - Get products by category

### Cart
- `GET /cart` - Get user cart
- `POST /cart/add` - Add item to cart
- `PUT /cart/items/:id` - Update cart item
- `DELETE /cart/items/:id` - Remove cart item
- `DELETE /cart/clear` - Clear cart

### Orders
- `POST /orders` - Create new order
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order details
- `GET /orders/:id/track` - Track order
- `PUT /orders/:id/cancel` - Cancel order

## Key Features

### 1. User Authentication
- JWT-based authentication
- Protected routes
- Auto token refresh
- Login/Register forms with validation

### 2. Product Management
- Product listing with search and filters
- Product detail pages
- Category-wise browsing
- Responsive product grid

### 3. Shopping Cart
- Add/remove products
- Quantity management
- Persistent cart (localStorage)
- Real-time price calculations

### 4. Checkout Process
- Address management
- Delivery slot selection
- Payment method selection
- Order confirmation

### 5. Order Management
- Order history
- Order tracking
- Order status updates
- Delivery agent contact

### 6. User Profile
- Profile information management
- Address book
- Password change
- Account settings

## Styling

- **Tailwind CSS** for utility-first styling
- **Inter font** for typography
- **Heroicons** for consistent iconography
- **Responsive design** for all screen sizes
- **Custom components** with consistent styling

## State Management

- **AuthContext**: User authentication state
- **CartContext**: Shopping cart state
- **React Hook Form**: Form state management
- **Local Storage**: Cart persistence

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Set the following environment variables for production:
- `REACT_APP_API_URL` - Backend API URL

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary to AUM Groceries.
