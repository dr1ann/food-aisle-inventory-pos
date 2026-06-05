# API Documentation - M&N Grocery Store Inventory System

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints except `/auth/login` require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Request/Response Format

### Success Response
```json
{
  "success": true,
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Authentication Endpoints

### 1. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "admin@foodaisle.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user_123",
      "email": "admin@foodaisle.com",
      "name": "Admin",
      "role": "admin"
    }
  }
}
```

### 2. Get Current User
**GET** `/auth/me`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "email": "admin@foodaisle.com",
    "role": "admin"
  }
}
```

---

## Products Endpoints

### 1. Get All Products
**GET** `/products`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_123",
      "name": "Apples",
      "barcode": "5901234123457",
      "price": "2.99",
      "categoryId": "cat_123",
      "supplierId": "sup_123",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "category": { "id": "cat_123", "name": "Produce" },
      "supplier": { "id": "sup_123", "name": "Fresh Farms Inc" },
      "stockMovements": []
    }
  ]
}
```

### 2. Get Products with Current Stock
**GET** `/products/with-stock`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_123",
      "name": "Apples",
      "barcode": "5901234123457",
      "price": "2.99",
      "currentStock": 45,
      ...
    }
  ]
}
```

### 3. Get Low Stock Products
**GET** `/products/low-stock?threshold=10`

**Query Parameters:**
- `threshold` (optional): Stock level threshold, default is 10

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_456",
      "name": "Milk (1L)",
      "currentStock": 5,
      ...
    }
  ]
}
```

### 4. Get Out of Stock Products
**GET** `/products/out-of-stock`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_789",
      "name": "Orange Juice",
      "currentStock": 0,
      ...
    }
  ]
}
```

### 5. Get Product by ID
**GET** `/products/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "prod_123",
    "name": "Apples",
    ...
  }
}
```

### 6. Create Product
**POST** `/products`

**Request Body:**
```json
{
  "name": "Oranges",
  "barcode": "5901234123463",
  "price": "3.49",
  "categoryId": "cat_123",
  "supplierId": "sup_123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "prod_new",
    "name": "Oranges",
    ...
  }
}
```

### 7. Update Product
**PUT** `/products/:id`

**Request Body:** (all fields optional)
```json
{
  "name": "Red Apples",
  "price": "3.49"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

### 8. Delete Product
**DELETE** `/products/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Product deleted successfully"
  }
}
```

---

## Stock Management Endpoints

### 1. Record Stock Movement
**POST** `/stock`

**Request Body:**
```json
{
  "productId": "prod_123",
  "quantity": 20,
  "type": "STOCK_IN",
  "notes": "Restocking from supplier"
}
```

**Type Values:**
- `STOCK_IN` - Stock received
- `STOCK_OUT` - Stock removed/damaged

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "mov_123",
    "productId": "prod_123",
    "quantity": 20,
    "type": "STOCK_IN",
    "notes": "Restocking from supplier",
    "date": "2024-01-15T14:30:00Z",
    "createdAt": "2024-01-15T14:30:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Insufficient stock. Current: 5, Attempting to remove: 10"
}
```

### 2. Get Stock Movements
**GET** `/stock/movements/:productId`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "mov_123",
      "productId": "prod_123",
      "quantity": 50,
      "type": "STOCK_IN",
      "notes": "Initial stock",
      "date": "2024-01-15T10:00:00Z",
      "product": { ... }
    }
  ]
}
```

### 3. Get Recent Stock Activity
**GET** `/stock/activity/recent?days=7`

**Query Parameters:**
- `days` (optional): Number of days to look back, default is 7

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "mov_123",
      "productId": "prod_123",
      "quantity": 20,
      "type": "STOCK_IN",
      "date": "2024-01-15T14:30:00Z",
      "product": {
        "id": "prod_123",
        "name": "Apples",
        "barcode": "5901234123457"
      }
    }
  ]
}
```

### 4. Get Total Stock Value
**GET** `/stock/value/total`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalValue": "1245.67"
  }
}
```

---

## Supplier Endpoints

### 1. Get All Suppliers
**GET** `/suppliers`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "sup_123",
      "name": "Fresh Farms Inc",
      "contactInfo": "+1-555-0101",
      "address": "123 Farm St, Agriculture City",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "products": [],
      "orders": []
    }
  ]
}
```

### 2. Get Supplier by ID
**GET** `/suppliers/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "sup_123",
    "name": "Fresh Farms Inc",
    "products": [...],
    "orders": [...]
  }
}
```

### 3. Get Supplier Products
**GET** `/suppliers/:id/products`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_123",
      "name": "Apples",
      ...
    }
  ]
}
```

### 4. Create Supplier
**POST** `/suppliers`

**Request Body:**
```json
{
  "name": "New Supplier",
  "contactInfo": "+1-555-0999",
  "address": "999 Supplier Ave, City"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "sup_new",
    ...
  }
}
```

### 5. Update Supplier
**PUT** `/suppliers/:id`

**Request Body:**
```json
{
  "name": "Updated Supplier Name",
  "contactInfo": "+1-555-0888"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

### 6. Delete Supplier
**DELETE** `/suppliers/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Supplier deleted successfully"
  }
}
```

---

## Category Endpoints

### 1. Get All Categories
**GET** `/categories`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_123",
      "name": "Produce",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "products": [...]
    }
  ]
}
```

### 2. Get Category by ID
**GET** `/categories/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cat_123",
    "name": "Produce",
    "products": [...]
  }
}
```

### 3. Create Category
**POST** `/categories`

**Request Body:**
```json
{
  "name": "Frozen Foods"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cat_new",
    "name": "Frozen Foods",
    ...
  }
}
```

### 4. Update Category
**PUT** `/categories/:id`

**Request Body:**
```json
{
  "name": "Organic Produce"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

### 5. Delete Category
**DELETE** `/categories/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Category deleted successfully"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Cannot delete category with products. Delete products first."
}
```

---

## Purchase Order Endpoints

### 1. Create Purchase Order
**POST** `/purchase-orders`

**Request Body:**
```json
{
  "supplierId": "sup_123",
  "items": [
    {
      "productId": "prod_123",
      "quantity": 50
    },
    {
      "productId": "prod_456",
      "quantity": 75
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "po_123",
    "supplierId": "sup_123",
    "status": "PENDING",
    "createdAt": "2024-01-15T14:30:00Z",
    "updatedAt": "2024-01-15T14:30:00Z",
    "supplier": { ... },
    "items": [
      {
        "id": "poi_123",
        "orderId": "po_123",
        "productId": "prod_123",
        "quantity": 50,
        "receivedQty": 0,
        "product": { ... }
      }
    ]
  }
}
```

### 2. Get All Purchase Orders
**GET** `/purchase-orders`

**Response (200):**
```json
{
  "success": true,
  "data": [...]
}
```

### 3. Get Purchase Order by ID
**GET** `/purchase-orders/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "po_123",
    ...
  }
}
```

### 4. Get Pending Purchase Orders
**GET** `/purchase-orders/pending`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "status": "PENDING",
      ...
    }
  ]
}
```

### 5. Get Orders by Supplier
**GET** `/purchase-orders/supplier/:supplierId`

**Response (200):**
```json
{
  "success": true,
  "data": [...]
}
```

### 6. Complete Purchase Order ⭐ **Critical Endpoint**
**POST** `/purchase-orders/:id/complete`

**Request Body:**
```json
{
  "items": [
    {
      "productId": "prod_123",
      "receivedQty": 50
    },
    {
      "productId": "prod_456",
      "receivedQty": 75
    }
  ]
}
```

**What happens:**
1. Order status changes to COMPLETED
2. For each item, creates a STOCK_IN movement with quantity = receivedQty
3. Updates receivedQty in order items
4. All operations are atomic (transaction)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "po_123",
    "status": "COMPLETED",
    "items": [
      {
        "productId": "prod_123",
        "quantity": 50,
        "receivedQty": 50
      }
    ],
    ...
  }
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input or business logic error |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Common Validation Rules

### Product Creation
- `name`: Required, non-empty string
- `barcode`: Required, unique string
- `price`: Required, valid decimal (e.g., "9.99")
- `categoryId`: Required, must exist
- `supplierId`: Optional, must exist if provided

### Stock Movement
- `productId`: Required, must exist
- `quantity`: Required, positive integer
- `type`: Required, either "STOCK_IN" or "STOCK_OUT"
- For STOCK_OUT: Cannot reduce stock below 0

### Purchase Order
- `supplierId`: Required, must exist
- `items`: Required, array with at least 1 item
- Each item must have valid productId and positive quantity

---

## Example Workflows

### Workflow 1: Add New Product and Initial Stock
1. POST `/categories` - Create category
2. POST `/suppliers` - Create supplier (optional)
3. POST `/products` - Create product
4. POST `/stock` - Record initial stock (STOCK_IN)

### Workflow 2: Restock from Supplier
1. POST `/purchase-orders` - Create PO with supplier and items
2. Wait for items to arrive...
3. POST `/purchase-orders/:id/complete` - Complete PO, auto-creates stock

### Workflow 3: Handle Damage/Deduction
1. POST `/stock` - Record STOCK_OUT with notes explaining reason

---

## Rate Limiting
Currently no rate limiting implemented. Implement based on production needs.

## Pagination
Currently no pagination implemented. All endpoints return full data.
Implement pagination for large datasets.

## Caching
No caching implemented. Consider implementing:
- Category caching (rarely changes)
- Product caching with invalidation on updates
- Dashboard metrics caching

