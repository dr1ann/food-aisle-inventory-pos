# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- MySQL 8.0+ running locally
- pnpm installed (`npm install -g pnpm`)

### Step 1: Install Dependencies
```bash
# Root directory
npm install

# Backend
cd backend
npm install
cd ..
```

### Step 2: Database Setup
```bash
# Create database
mysql -u root -e "CREATE DATABASE foodaisle_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations and seed
cd backend
npm run prisma:migrate
npm run prisma:seed
cd ..
```

### Step 3: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Output: ✅ Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Output: VITE v6.3.5 ready in 123 ms
#         ➜  Local:   http://localhost:5173/
```

### Step 4: Access Application
- Open browser to `http://localhost:5173`
- Login with:
  - Email: `admin@foodaisle.com`
  - Password: `admin123`

### Step 5: API Testing
```bash
# Get auth token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@foodaisle.com","password":"admin123"}'

# Copy token from response and test API
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📁 Project Structure

```
FoodAisle-Grocery-Store/
├── .env                          # Backend env (created)
├── .env.frontend                 # Frontend env (created)
├── backend/
│   ├── src/
│   │   ├── index.ts             # Express server entry
│   │   ├── controllers/         # HTTP handlers
│   │   ├── services/            # Business logic
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Auth, validation
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # Helper functions
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.ts              # Initial data
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── services/
│   │   └── api.ts               # API client
│   └── app/                     # Frontend components
├── package.json
├── SETUP.md                     # Complete setup guide
├── API_DOCUMENTATION.md         # API reference
└── DATABASE_SETUP.md            # DB configuration

```

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `.env` | MySQL credentials, JWT secret, ports |
| `backend/prisma/schema.prisma` | Database schema |
| `backend/prisma/seed.ts` | Sample data |
| `backend/src/index.ts` | Express server |
| `src/services/api.ts` | Frontend API client |
| `SETUP.md` | Detailed setup instructions |
| `API_DOCUMENTATION.md` | Complete API reference |

## 🧪 Test the System

### Test 1: Create Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "barcode": "9999999999999",
    "price": "5.99",
    "categoryId": "CATEGORY_ID"
  }'
```

### Test 2: Record Stock
```bash
curl -X POST http://localhost:5000/api/stock \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID",
    "quantity": 10,
    "type": "STOCK_IN"
  }'
```

### Test 3: Create Purchase Order
```bash
curl -X POST http://localhost:5000/api/purchase-orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "SUPPLIER_ID",
    "items": [{"productId": "PRODUCT_ID", "quantity": 5}]
  }'
```

## 🐛 Troubleshooting

### MySQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Fix:**
- Start MySQL: `mysql.server start` (macOS) or restart MySQL service
- Check DATABASE_URL in .env matches your setup
- Verify database: `mysql -u root -e "SHOW DATABASES;"`

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Fix:**
- Kill process: `lsof -ti:5000 | xargs kill -9` (macOS/Linux)
- Or change PORT in .env to 5001, 5002, etc.

### Prisma Migration Error
```
Error: Migration not found
```
**Fix:**
```bash
cd backend
pnpm prisma:migrate reset
pnpm prisma:seed
```

### Cannot Login
- Verify database was seeded: `pnpm prisma:seed`
- Check credentials: `admin@foodaisle.com` / `admin123`
- Clear browser localStorage and try again

## 📚 Documentation

- **Full Setup**: [SETUP.md](./SETUP.md)
- **API Reference**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Database**: [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **AGENT Rules**: [AGENT.md](./AGENT.md)

## 🎯 Next Steps

1. **Explore Dashboard** - View inventory overview
2. **Add Products** - Create new products
3. **Manage Stock** - Record stock movements
4. **Create Purchase Orders** - Order from suppliers
5. **Monitor Inventory** - Track stock levels

## 💡 Key Features

✅ **Product Management** - Add, edit, delete products  
✅ **Stock Tracking** - Prevent negative stock  
✅ **Purchase Orders** - Auto stock-in on completion  
✅ **Supplier Management** - Manage suppliers  
✅ **Category Management** - Organize products  
✅ **Dashboard Analytics** - Real-time inventory metrics  
✅ **JWT Authentication** - Secure access  
✅ **Type Safety** - Full TypeScript coverage  

## 🚨 Critical Rules

1. **No Direct Stock Editing** - Use Stock Management module
2. **Prevent Negative Stock** - System validates before allowing STOCK_OUT
3. **Transactional Updates** - Purchase order completion is atomic
4. **No "any" Types** - Strict TypeScript throughout
5. **Zod Validation** - All inputs validated

## 📞 Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](./SETUP.md#troubleshooting) in SETUP.md
2. Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. Check backend logs: `cd backend && pnpm dev`
4. Verify database: `mysql -u root foodaisle_db -e "SHOW TABLES;"`

## 🎓 Architecture Overview

```
User (Browser)
  ↓
Frontend (React + TypeScript)
  ↓
API Client (fetch)
  ↓
Express Server (Node.js + TypeScript)
  ↓
Prisma ORM
  ↓
MySQL Database
```

## ⚡ Performance Tips

- Use `/products/with-stock` endpoint for stock data
- Use `/products/low-stock` for inventory alerts
- Cache category list on frontend (rarely changes)
- Limit dashboard metrics to recent data (7 days default)

---

**Ready to go!** 🎉

Start the servers and access http://localhost:5173
