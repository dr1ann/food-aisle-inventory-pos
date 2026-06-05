# Database Migration and Setup Guide

## Automatic Setup (Recommended)

### Step 1: Create Database
```bash
mysql -u root -p -e "CREATE DATABASE foodaisle_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Step 2: Run Migrations
```bash
cd backend
pnpm prisma:migrate
```

This will:
- Create all tables from schema.prisma
- Apply any pending migrations
- Prompt for migration name if needed

### Step 3: Generate Prisma Client
```bash
pnpm prisma:generate
```

### Step 4: Seed Database with Sample Data
```bash
pnpm prisma:seed
```

This will:
- Create sample categories (Produce, Dairy, Meat, Beverages, Snacks)
- Create sample suppliers (Fresh Farms Inc, Dairy Fresh Co, Meat Masters)
- Create sample products (Apples, Bananas, Milk, Yogurt, Chicken, Orange Juice)
- Add initial stock (STOCK_IN movements)
- Create admin user: `admin@foodaisle.com` / `admin123`

## Manual Setup (If Migrations Fail)

### Step 1: Create Database
```bash
mysql -u root -p
CREATE DATABASE foodaisle_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE foodaisle_db;
```

### Step 2: Create Tables Manually

```sql
-- Users table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'staff',
  isActive BOOLEAN DEFAULT true,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- Categories table
CREATE TABLE categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Suppliers table
CREATE TABLE suppliers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contactInfo VARCHAR(255),
  address TEXT,
  isActive BOOLEAN DEFAULT true,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  barcode VARCHAR(255) UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  categoryId VARCHAR(36) NOT NULL,
  supplierId VARCHAR(36),
  isActive BOOLEAN DEFAULT true,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_categoryId (categoryId),
  INDEX idx_supplierId (supplierId),
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (supplierId) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Stock movements table
CREATE TABLE stock_movements (
  id VARCHAR(36) PRIMARY KEY,
  productId VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  notes TEXT,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_productId (productId),
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE RESTRICT
);

-- Purchase orders table
CREATE TABLE purchase_orders (
  id VARCHAR(36) PRIMARY KEY,
  supplierId VARCHAR(36) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_supplierId (supplierId),
  FOREIGN KEY (supplierId) REFERENCES suppliers(id) ON DELETE RESTRICT
);

-- Purchase order items table
CREATE TABLE purchase_order_items (
  id VARCHAR(36) PRIMARY KEY,
  orderId VARCHAR(36) NOT NULL,
  productId VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  receivedQty INT DEFAULT 0,
  INDEX idx_orderId (orderId),
  INDEX idx_productId (productId),
  UNIQUE KEY unique_order_product (orderId, productId),
  FOREIGN KEY (orderId) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE RESTRICT
);
```

## Verification

### Check Tables Created
```bash
mysql -u root foodaisle_db -e "SHOW TABLES;"
```

### Check Table Schema
```bash
mysql -u root foodaisle_db -e "DESCRIBE users;"
```

### Check Data
```bash
mysql -u root foodaisle_db -e "SELECT * FROM users;"
mysql -u root foodaisle_db -e "SELECT * FROM categories;"
mysql -u root foodaisle_db -e "SELECT * FROM products;"
```

## Resetting Database

### Option 1: Drop and Recreate
```bash
mysql -u root -p -e "DROP DATABASE foodaisle_db; CREATE DATABASE foodaisle_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
cd backend
pnpm prisma:migrate
pnpm prisma:seed
```

### Option 2: Using Prisma Reset
```bash
cd backend
pnpm prisma:migrate reset
```

## Troubleshooting

### Issue: "Error: PROTOCOL_CONN_LOST"
**Solution:**
- MySQL might be down: `mysql.server start` (macOS) or restart MySQL service
- Check DATABASE_URL in .env: `mysql://root:@localhost:3306/foodaisle_db`
- Verify database exists: `mysql -u root -e "SHOW DATABASES;"`

### Issue: "Error: Column name is reserved"
**Solution:**
- This shouldn't happen with Prisma. Update schema.prisma and re-run migrations.

### Issue: "Error: Foreign key constraint failed"
**Solution:**
- When deleting, ensure no related records exist
- Check referential integrity before deletion

### Issue: "Error: Unique constraint failed"
**Solution:**
- Barcode must be unique per product
- Email must be unique per user
- Category name must be unique

## Best Practices

1. **Always backup before migrations:**
   ```bash
   mysqldump -u root foodaisle_db > backup.sql
   ```

2. **Test migrations in development first**

3. **Use transactions for critical operations:**
   - Already implemented in purchase order completion

4. **Monitor migration status:**
   ```bash
   cd backend
   pnpm prisma:migrate status
   ```

5. **Keep seed data updated:**
   - Modify prisma/seed.ts as needed
   - Re-run seeding: `pnpm prisma:seed`

## Connection Pool Settings

For production, consider connection pool optimization in .env:
```
DATABASE_URL="mysql://root:password@localhost:3306/foodaisle_db?connection_limit=10"
```

## Next Steps

1. After setup, test API: `curl http://localhost:5000/api/health`
2. Login with: `admin@foodaisle.com` / `admin123`
3. Start using the system!
