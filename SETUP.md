# M&N Grocery Store - Inventory Management System

A production-grade inventory management system for small to medium grocery store operations. Built with React + TypeScript (frontend) and Node.js + Express + TypeScript (backend) with MySQL database.

## 📋 Features

### 1. **Dashboard**
- Display total products, categories, suppliers
- Low stock items (configurable threshold)
- Out of stock items
- Recent stock activity (last 7 days)
- Total inventory value

### 2. **Product Management**
- Create, read, update, delete products
- Unique barcode tracking
- Price management
- Category assignment
- Supplier assignment
- Stock is read-only (managed through Stock Management)

### 3. **Stock Management** ⭐
- Record stock movements: STOCK_IN (restock) and STOCK_OUT (damage/deduction)
- Prevent negative stock (validation)
- Track stock history
- Real-time stock calculations
- Recent activity view (configurable days)

### 4. **Supplier Management**
- Create, read, update, delete suppliers
- Supplier contact information and address
- View supplier products
- View supplier purchase orders

### 5. **Purchase Order System** ⭐
- Create purchase orders from suppliers
- Track pending and completed orders
- Auto-create STOCK_IN entries when order completes
- Receive quantities tracking
- Transaction-based completion (atomic operations)

### 6. **Category Management**
- Create, read, update, delete categories
- Prevent category deletion if products exist
- View products by category

## 🏗️ Architecture

```
Frontend (React + TypeScript + Vite)
  ├─ Pages: Login, Dashboard, Products, Stock, Suppliers, PurchaseOrders
  ├─ Services: API client
  └─ Components: Reusable UI components

Backend (Node.js + Express + TypeScript)
  ├─ Controllers: HTTP request handlers
  ├─ Services: Business logic
  ├─ Middleware: Auth, validation
  ├─ Routes: API endpoints
  └─ Database: Prisma ORM + MySQL

Database (MySQL)
  ├─ Users
  ├─ Products
  ├─ Categories
  ├─ Suppliers
  ├─ StockMovements
  └─ PurchaseOrders
```

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: MySQL with Prisma ORM
- **Validation**: Zod
- **Authentication**: JWT
- **Password Hashing**: bcryptjs
- **HTTP Client**: Fetch API

## 📦 Prerequisites

- Node.js 18+
- pnpm (or npm)
- MySQL Server 8.0+
- Git

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install root and backend dependencies
npm install
cd backend
npm install
cd ..
```

### 2. Database Setup

```bash
# Create database
mysql -u root -e "CREATE DATABASE foodaisle_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations
cd backend
npm run prisma:migrate
npm run prisma:seed
cd ..
```

### 3. Environment Files

Root `.env` (already created):
```
DATABASE_URL=mysql://root:@localhost:3306/foodaisle_db
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_in_production_12345
JWT_EXPIRY=7d
FRONTEND_URL=http://localhost:5173
```

Frontend `.env.frontend` (already created):
```
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# App runs on http://localhost:5173
```

### 5. Login

- **Email**: `admin@foodaisle.com`
- **Password**: `admin123`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/with-stock` - Get products with current stock
- `GET /api/products/low-stock?threshold=10` - Get low stock products
- `GET /api/products/out-of-stock` - Get out of stock products
- `GET /api/products/category/:categoryId` - Get products by category
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product (soft delete)

### Stock Management
- `POST /api/stock` - Record stock movement (STOCK_IN/STOCK_OUT)
- `GET /api/stock/movements/:productId` - Get stock movements for product
- `GET /api/stock/activity/recent?days=7` - Get recent stock activity
- `GET /api/stock/value/total` - Get total inventory value

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get supplier by ID
- `GET /api/suppliers/:id/products` - Get supplier's products
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier (soft delete)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Purchase Orders
- `POST /api/purchase-orders` - Create purchase order
- `GET /api/purchase-orders` - Get all purchase orders
- `GET /api/purchase-orders/:id` - Get purchase order by ID
- `GET /api/purchase-orders/pending` - Get pending orders
- `GET /api/purchase-orders/supplier/:supplierId` - Get orders by supplier
- `POST /api/purchase-orders/:id/complete` - Complete purchase order

## 📝 API Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": { /* response data */ }
}
```

Error response:
```json
{
  "success": false,
  "error": "Error message"
}
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (admin/staff)
- Input validation with Zod
- CORS configuration
- SQL injection prevention (Prisma)
- HTTP-only token storage

## 📊 Database Schema

### Users
- `id` (CUID)
- `email` (unique)
- `password` (hashed)
- `name`
- `role` (admin/staff)
- `isActive`
- `createdAt`, `updatedAt`

### Products
- `id` (CUID)
- `name`
- `barcode` (unique)
- `price` (decimal)
- `categoryId` (FK)
- `supplierId` (FK, optional)
- `isActive`
- `createdAt`, `updatedAt`

### Categories
- `id` (CUID)
- `name` (unique)
- `createdAt`, `updatedAt`

### Suppliers
- `id` (CUID)
- `name`
- `contactInfo` (optional)
- `address` (optional)
- `isActive`
- `createdAt`, `updatedAt`

### StockMovements
- `id` (CUID)
- `productId` (FK)
- `quantity` (int)
- `type` (STOCK_IN/STOCK_OUT)
- `notes` (optional)
- `date` (timestamp)
- `createdAt`

### PurchaseOrders
- `id` (CUID)
- `supplierId` (FK)
- `status` (PENDING/COMPLETED)
- `createdAt`, `updatedAt`

### PurchaseOrderItems
- `id` (CUID)
- `orderId` (FK)
- `productId` (FK)
- `quantity` (int)
- `receivedQty` (int, default: 0)

## 🧪 Testing

### Create a Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "barcode": "1234567890",
    "price": "9.99",
    "categoryId": "CATEGORY_ID",
    "supplierId": "SUPPLIER_ID"
  }'
```

### Record Stock Movement
```bash
curl -X POST http://localhost:5000/api/stock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID",
    "quantity": 10,
    "type": "STOCK_IN",
    "notes": "Restock from supplier"
  }'
```

### Create Purchase Order
```bash
curl -X POST http://localhost:5000/api/purchase-orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "SUPPLIER_ID",
    "items": [
      {
        "productId": "PRODUCT_ID",
        "quantity": 50
      }
    ]
  }'
```

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
- Ensure MySQL is running
- Check DATABASE_URL in .env
- Verify database exists: `mysql -u root -e "SHOW DATABASES;"`

### JWT Token Errors
- Token expires in 7 days by default (set by JWT_EXPIRY)
- Clear localStorage and login again
- Check JWT_SECRET is set correctly

### CORS Errors
- Ensure FRONTEND_URL matches your frontend URL
- Check both ports are correct (5173 for frontend, 5000 for backend)

### Negative Stock Error
- Cannot remove more stock than available
- Check current stock before STOCK_OUT
- Use `/api/stock/movements/:productId` to view history

## 📖 Best Practices

1. **Stock Management**
   - Always use Stock Management module for changes
   - Don't edit stock directly in Product module
   - Track all movements with proper notes

2. **Purchase Orders**
   - Create purchase orders for bulk restocking
   - Complete orders to auto-create stock entries
   - Track supplier performance

3. **Data Integrity**
   - All operations use transactions where needed
   - Prevent negative stock with validation
   - Soft delete for historical tracking

4. **Security**
   - Change JWT_SECRET in production
   - Use environment variables for sensitive data
   - Implement role-based access on frontend
   - Use HTTPS in production

## 📱 Frontend Pages

1. **Login** - Authentication
2. **Dashboard** - Overview and analytics
3. **Products** - Product CRUD operations
4. **Stock Management** - Record stock movements
5. **Suppliers** - Supplier management
6. **Purchase Orders** - PO creation and tracking
7. **Categories** - Category management

## 🚀 Production Deployment

1. Build backend: `cd backend && pnpm build`
2. Build frontend: `pnpm build`
3. Set production environment variables
4. Use PM2 or similar for process management
5. Set up MySQL with backups
6. Configure HTTPS/SSL
7. Set up monitoring and logging

## 📄 License

Proprietary - M&N Grocery Store

## 👥 Support

For issues or questions, contact the development team.
