# Code Flow & Architecture

This document explains how the Grocery Store Inventory System is structured and how data flows through the frontend and backend.

---

## Table of Contents
1. [High-Level Architecture](#high-level-architecture)
2. [Frontend Flow](#frontend-flow)
3. [Backend Flow](#backend-flow)
4. [Data Transformation Pipeline](#data-transformation-pipeline)
5. [Feature Workflows](#feature-workflows)
6. [Error Handling](#error-handling)
7. [Type Safety](#type-safety)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER / USER                        │
└──────────────────────────┬──────────────────────────────┘
                           │
                  ┌────────▼────────┐
                  │  React Component │
                  │  (UI/Forms)      │
                  └────────┬────────┘
                           │ calls
                  ┌────────▼────────┐
                  │   useStore()     │
                  │  (State Manager) │
                  └────────┬────────┘
                           │ calls
                  ┌────────▼────────┐
                  │  ApiService      │
                  │  (HTTP Client)   │
                  └────────┬────────┘
                           │ HTTP POST/GET/PUT
        ┌──────────────────▼──────────────────┐
        │                                       │
┌───────▼────────┐                  ┌────────▼────────┐
│   Backend API   │                  │    MySQL DB      │
│   (Express)     │◄────────────────►│   (Prisma ORM)   │
│                 │                  │                  │
│ Controllers     │                  └──────────────────┘
│ Services        │
│ Middleware      │
└─────────────────┘
```

---

## Frontend Flow

### Layer 1: UI Components
**Location:** `src/app/components/`

Components handle **user interaction only**:
- Display data
- Capture form input
- Call store actions
- Show errors/loading states

**Example:** `Products.tsx`
```typescript
// 1. Get data from store
const { products, addProduct } = useStore();

// 2. Handle user input (form submission)
const handleSubmit = async (e) => {
  const data = { name, categoryId, supplierId, price };
  
  // 3. Call store action (which throws on error)
  try {
    await addProduct(data);
  } catch (error) {
    setFormError(error.message); // Show error in UI
  }
};
```

### Layer 2: State Management (store.tsx)
**Location:** `src/app/store.tsx`

The store is the **single source of truth**:
- Holds all app data in React state
- Coordinates API calls
- Transforms data for UI consumption
- Propagates errors to components

**Architecture:**
```typescript
// 1. Context + Provider pattern
const StoreContext = createContext<StoreContextType>();
export function StoreProvider({ children }) { ... }

// 2. Hook to access store from any component
export function useStore() { ... }

// 3. Data interfaces (what UI sees)
export interface Product {
  id: string;
  name: string;
  category: string;
  supplier: string;
  price: number;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

// 4. Actions that call API
const addProduct = async (product: ProductFormInput) => {
  await apiService.createProduct(...);
  await refreshData(); // Fetch all data again
};
```

### Layer 3: API Service
**Location:** `src/services/api.ts`

Handles **HTTP communication**:
- Makes fetch requests
- Adds auth headers
- Parses responses
- Throws meaningful errors

**Key Method:**
```typescript
private async request<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: unknown
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: this.getHeaders(), // Adds JWT token
    body: body ? JSON.stringify(body) : undefined,
  });

  // Extract error message from backend
  const errorBody = payload?.error || statusText;
  throw new Error(errorBody);
}
```

---

## Backend Flow

### Layer 1: HTTP Routes
**Location:** `backend/src/routes/`

Entry points for each feature:
```typescript
// routes/product.ts
router.post('/', authMiddleware, createProduct);
router.get('/', authMiddleware, getProducts);
router.put('/:id', authMiddleware, updateProduct);
```

### Layer 2: Controllers
**Location:** `backend/src/controllers/`

Handle **HTTP layer concerns**:
- Parse request body
- Validate with Zod
- Call service logic
- Return formatted response

**Example:**
```typescript
export async function createProduct(req: Request, res: Response) {
  try {
    // 1. Validate input
    const validatedData = CreateProductSchema.parse(req.body);
    
    // 2. Call business logic
    const product = await productService.createProduct(validatedData);
    
    // 3. Return success response
    sendSuccess(res, product, 201);
  } catch (error) {
    // 4. Handle validation errors
    sendError(res, error.message, 400);
  }
}
```

### Layer 3: Services (Business Logic)
**Location:** `backend/src/services/`

Contains **all business rules**:
- Data validation
- Database operations
- Transaction management
- Domain logic

**Example:**
```typescript
export async function createProduct(data: CreateProductRequest) {
  // Check business rules
  const existingProduct = await prisma.product.findUnique({
    where: { barcode: data.barcode },
  });
  if (existingProduct) {
    throw new Error("Barcode already exists");
  }

  // Check category exists
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) {
    throw new Error("Category not found");
  }

  // Create and return
  return prisma.product.create({
    data: {
      name: data.name,
      barcode: data.barcode,
      price: data.price,
      categoryId: data.categoryId,
      supplierId: data.supplierId || null,
    },
    include: { category: true, supplier: true },
  });
}
```

### Layer 4: Database (Prisma ORM)
**Location:** `backend/prisma/schema.prisma`

Defines data models:
```prisma
model Product {
  id        String @id @default(cuid())
  name      String
  barcode   String @unique
  price     String
  isActive  Boolean @default(true)
  
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id])
  
  supplierId String?
  supplier   Supplier? @relation(fields: [supplierId], references: [id])
  
  stockMovements StockMovement[]
}
```

---

## Data Transformation Pipeline

Data flows through multiple transformations from backend → UI:

### Step 1: Database Result
```typescript
// Raw database record
{
  id: "prod_123",
  name: "Apples",
  barcode: "5901234123457",
  price: "2.99",
  categoryId: "cat_456",
  category: { id: "cat_456", name: "Produce" },
  supplier: { id: "sup_789", name: "Local Farm" },
  stockMovements: [
    { type: "STOCK_IN", quantity: 100, date: "2024-01-15" },
    { type: "STOCK_OUT", quantity: 25, date: "2024-01-16" }
  ]
}
```

### Step 2: Service Response
Service returns data as-is (with relations included)

### Step 3: API Response
```typescript
{
  success: true,
  data: {
    id: "prod_123",
    name: "Apples",
    barcode: "5901234123457",
    price: "2.99",
    category: { id: "cat_456", name: "Produce" },
    supplier: { id: "sup_789", name: "Local Farm" },
    currentStock: 75  // Calculated: 100 - 25
  }
}
```

### Step 4: API Client Parses
```typescript
async getProductsWithStock(): Promise<ApiProductWithStock[]> {
  return this.request("/products/with-stock");
}
```

### Step 5: Store Transforms for UI
```typescript
// mapProduct() helper function
function mapProduct(product: ApiProductWithStock): Product {
  return {
    id: product.id,
    name: product.name,
    category: product.category.name,          // Extract name
    supplier: product.supplier?.name ?? 'Unassigned', // Handle null
    price: Number(product.price),             // Convert string to number
    stock: product.currentStock,
    status: toProductStatus(product.currentStock), // Calculate status
  };
}
```

### Step 6: UI Renders
```typescript
// Component receives simplified data
const { products } = useStore();

products.map(p => (
  <tr>
    <td>{p.name}</td>
    <td>{p.category}</td>
    <td>{p.supplier}</td>
    <td>{p.status}</td>
  </tr>
))
```

---

## Feature Workflows

### Workflow 1: Add Product

**User Action:**
```
1. User clicks "Add Product" button
2. Modal opens with form
3. User fills: name, category, supplier, price
4. User submits form
```

**Component (Products.tsx):**
```typescript
const handleSubmit = async (e) => {
  // Parse form data
  const productData = {
    name: "Bananas",
    categoryId: "cat_123",
    supplierId: "sup_456",
    price: 1.99,
  };

  try {
    // Call store action
    await addProduct(productData);
    
    // On success: modal closes, table refreshes
    setShowModal(false);
  } catch (error) {
    // On error: show in modal
    setFormError(error.message);
  }
};
```

**Store (store.tsx):**
```typescript
const addProduct = async (product: ProductFormInput) => {
  try {
    // Send to backend
    await apiService.createProduct({
      name: product.name,
      barcode: `${Date.now()}`,  // Auto-generate
      price: product.price.toString(),
      categoryId: product.categoryId,
      supplierId: product.supplierId || undefined,
    });
    
    // Refresh all data (products, stock, etc.)
    await refreshData();
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to add product.'));
  }
};
```

**API (apiService.ts):**
```typescript
async createProduct(data: unknown): Promise<unknown> {
  return this.request("/products", "POST", data);
}
```

**Backend Controller:**
```typescript
export async function createProduct(req: Request, res: Response) {
  const validatedData = CreateProductSchema.parse(req.body);
  const product = await productService.createProduct(validatedData);
  sendSuccess(res, product, 201);
}
```

**Backend Service:**
```typescript
export async function createProduct(data: CreateProductRequest) {
  // Check barcode uniqueness
  const existing = await prisma.product.findUnique({
    where: { barcode: data.barcode },
  });
  if (existing) throw new Error("Barcode already exists");

  // Create product
  return prisma.product.create({ data: { ... } });
}
```

**Backend Response:**
```json
{
  "success": true,
  "data": {
    "id": "prod_123",
    "name": "Bananas",
    "category": { "id": "cat_123", "name": "Produce" },
    ...
  }
}
```

**Back to Store:**
```typescript
// refreshData() fetches all products
const productsRes = await apiService.getProductsWithStock();
setProducts(productsRes.map(mapProduct)); // Transform and update state
```

**Back to Component:**
```typescript
// Component re-renders with new product in table
const { products } = useStore(); // New data!
```

---

### Workflow 2: Complete Purchase Order

**User Action:**
```
1. User views Pending purchase order
2. User clicks "Mark as Completed"
3. Stock automatically increases
```

**Component (PurchaseOrders.tsx):**
```typescript
const handleComplete = () => {
  completePurchaseOrder(po.id);
};
```

**Store (store.tsx):**
```typescript
const completePurchaseOrder = async (id: string) => {
  try {
    const po = purchaseOrders.find(p => p.id === id);
    
    // Send completion request with items
    await apiService.completePurchaseOrder(id, {
      items: po.items.map(item => ({
        productId: item.productId,
        receivedQty: item.quantity,
      })),
    });
    
    // Refresh all data
    await refreshData();
  } catch (error) {
    console.error('Failed to complete purchase order:', error);
  }
};
```

**Backend Service (purchaseOrder.ts):**
```typescript
export async function completePurchaseOrder(
  id: string,
  data: CompletePurchaseOrderRequest
) {
  // Start transaction
  return prisma.$transaction(async (tx) => {
    // 1. Update PO status
    const po = await tx.purchaseOrder.update({
      where: { id },
      data: { status: "COMPLETED" },
    });

    // 2. Create STOCK_IN for each item
    for (const item of data.items) {
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.receivedQty,
          type: "STOCK_IN",
          date: new Date(),
        },
      });
    }

    return po;
  });
}
```

**Result:**
```
1. PO marked as COMPLETED
2. Stock movements recorded
3. Product stock updated
4. Store refreshes all data
5. UI shows updated stock & PO status
```

---

## Error Handling

### Error Flow

```
Component Form Submission
  ↓
Store Action Called
  ↓
API Request Made
  ↓
Backend Validation Fails
  ↓
Backend sends error response:
{
  "success": false,
  "error": "Barcode already exists"
}
  ↓
API client extracts error message
  ↓
Store throws: Error("Barcode already exists")
  ↓
Component catches and displays in UI
```

### Example: Product with Duplicate Barcode

**User submits:** `{ name: "Apples", barcode: "123", ... }`

**Backend Validation (service):**
```typescript
const existing = await prisma.product.findUnique({
  where: { barcode: data.barcode },
});
if (existing) {
  throw new Error("Barcode already exists");
}
```

**Backend Controller (catches error):**
```typescript
catch (error: unknown) {
  if (error instanceof Error) {
    sendError(res, error.message, 400);
  }
}
```

**Response:**
```json
{
  "success": false,
  "error": "Barcode already exists"
}
```

**API Client (extracts error):**
```typescript
if (!response.ok) {
  const errorBody = payload?.error || response.statusText;
  throw new Error(errorBody); // "Barcode already exists"
}
```

**Store (propagates error):**
```typescript
catch (error) {
  throw new Error(getErrorMessage(error, 'Failed to add product.'));
}
```

**Component (displays to user):**
```typescript
catch (error) {
  setFormError(error.message); // Shows: "Barcode already exists"
}
```

---

## Type Safety

The system enforces type safety at every layer:

### 1. Frontend Request (ProductFormInput)
```typescript
export interface ProductFormInput {
  name: string;
  categoryId: string;
  supplierId?: string;
  price: number;
}
```

### 2. API Request (CreateProductSchema)
```typescript
export const CreateProductSchema = z.object({
  name: z.string().min(1),
  barcode: z.string().min(1),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  categoryId: z.string().min(1),
  supplierId: z.string().optional().nullable(),
});

export type CreateProductRequest = z.infer<typeof CreateProductSchema>;
```

### 3. Backend Service
```typescript
export async function createProduct(data: CreateProductRequest) {
  // data is guaranteed to match schema
  return prisma.product.create({ data: { ... } });
}
```

### 4. API Response (ApiProductWithStock)
```typescript
export interface ApiProductWithStock {
  id: string;
  name: string;
  barcode: string;
  price: string;
  category: ApiCategory;
  supplier: ApiSupplier | null;
  currentStock: number;
}
```

### 5. Frontend State (Product)
```typescript
export interface Product {
  id: string;
  name: string;
  category: string;
  supplier: string;
  price: number;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}
```

**Flow:**
```
Component Input (ProductFormInput)
  ↓
Store validates & sends (CreateProductRequest via Zod)
  ↓
Backend parses (Zod schema validation)
  ↓
Database operation
  ↓
Backend returns (with includes: category, supplier)
  ↓
API response (ApiProductWithStock)
  ↓
Store transforms (mapProduct function)
  ↓
Frontend state (Product)
  ↓
Component renders with typed data
```

---

## Key Principles

1. **Separation of Concerns**
   - Components: UI only
   - Store: State + orchestration
   - Services: Business logic
   - Controllers: HTTP handling

2. **Single Source of Truth**
   - All data flows through the store
   - Components never have their own copy

3. **Error Propagation**
   - Errors bubble from backend → store → component
   - Each layer can enhance/transform the error

4. **Type Safety**
   - Zod schemas validate at backend boundaries
   - TypeScript ensures compile-time safety
   - Interfaces define contracts between layers

5. **Async Consistency**
   - After every mutation, refresh all data
   - Keeps UI in sync with backend state

---

## Summary

```
USER ACTION
  │
  └─→ Component (UI Layer)
        │ useStore()
        ├─→ Store (State + Orchestration)
        │     │ apiService.
        │     └─→ API Service (HTTP Client)
        │           │ fetch()
        │           └─→ Backend Server (Node/Express)
        │                 │ routes
        │                 ├─→ Controllers (HTTP layer)
        │                 │     │ validate
        │                 │     ├─→ Services (Business Logic)
        │                 │     │     │
        │                 │     │     └─→ Prisma (Database Layer)
        │                 │     │           │
        │                 │     │           └─→ MySQL
        │                 │     │
        │                 │     └─→ Response
        │                 │
        │                 └─→ JSON Response
        │
        └─→ Store (Transform data)
              │
              └─→ Component (Re-render)
                    │
                    └─→ USER SEES UPDATED UI
```

