import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import {
  apiService,
  ApiProductWithStock,
  ApiStockMovement,
  ApiPurchaseOrder,
  ApiSupplier,
  ApiCategory,
} from '../services/api';

export interface Product {
  id: string;
  name: string;
  category: string;
  supplier: string;
  price: number;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  address: string;
}

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: string;
  notes: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  status: 'Pending' | 'Completed';
  date: string;
  items: { productId: string; productName: string; quantity: number }[];
}

interface StoreContextType {
  products: Product[];
  suppliers: Supplier[];
  categories: Category[];
  stockMovements: StockMovement[];
  purchaseOrders: PurchaseOrder[];
  loading: boolean;
  addProduct: (product: ProductFormInput) => Promise<void>;
  updateProduct: (id: string, product: Partial<ProductFormInput>) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  toggleCategoryStatus: (id: string) => void;
  addStockMovement: (movement: Omit<StockMovement, 'id'>) => void;
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id'>) => void;
  completePurchaseOrder: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export interface ProductFormInput {
  name: string;
  categoryId: string;
  supplierId?: string;
  price: number;
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

function toProductStatus(stock: number): Product['status'] {
  if (stock <= 0) {
    return 'Out of Stock';
  }

  if (stock <= 10) {
    return 'Low Stock';
  }

  return 'In Stock';
}

function mapProduct(product: ApiProductWithStock): Product {
  return {
    id: product.id,
    name: product.name,
    category: product.category.name,
    supplier: product.supplier?.name ?? 'Unassigned',
    price: Number(product.price),
    stock: product.currentStock,
    status: toProductStatus(product.currentStock),
  };
}

function mapSupplier(supplier: ApiSupplier): Supplier {
  return {
    id: supplier.id,
    name: supplier.name,
    contact: supplier.contactInfo ?? '',
    address: supplier.address ?? '',
  };
}

function mapStockMovement(movement: ApiStockMovement): StockMovement {
  return {
    id: movement.id,
    productId: movement.productId,
    productName: movement.product.name,
    type: movement.type === 'STOCK_IN' ? 'IN' : 'OUT',
    quantity: movement.quantity,
    date: new Date(movement.date).toISOString().split('T')[0],
    notes: movement.notes ?? '',
  };
}

function mapPurchaseOrder(order: ApiPurchaseOrder): PurchaseOrder {
  return {
    id: order.id,
    supplierId: order.supplierId,
    supplierName: order.supplier.name,
    status: order.status === 'COMPLETED' ? 'Completed' : 'Pending',
    date: new Date(order.createdAt).toISOString().split('T')[0],
    items: order.items.map((item) => ({
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
    })),
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      setLoading(true);

      const [productsRes, suppliersRes, categoriesRes, stockRes, ordersRes] = await Promise.all([
        apiService.getProductsWithStock(),
        apiService.getSuppliers(),
        apiService.getCategories(),
        apiService.getRecentStockActivity(),
        apiService.getPurchaseOrders(),
      ]);

      setProducts(productsRes.map(mapProduct));
      setSuppliers(suppliersRes.map(mapSupplier));
      setCategories(categoriesRes);
      setStockMovements(stockRes.map(mapStockMovement));
      setPurchaseOrders(ordersRes.map(mapPurchaseOrder));
    } catch (error) {
      console.error('Failed to fetch data from API:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data from API on mount
  useEffect(() => {
    void refreshData();
  }, []);

  const addProduct = async (product: ProductFormInput): Promise<void> => {
    try {
      if (!product.categoryId) {
        throw new Error('Category is required.');
      }

      await apiService.createProduct({
        name: product.name,
        barcode: `${Date.now()}`,
        price: product.price.toString(),
        categoryId: product.categoryId,
        supplierId: product.supplierId || undefined,
      });
      await refreshData();
    } catch (error) {
      console.error('Failed to add product:', error);
      throw new Error(getErrorMessage(error, 'Failed to add product.'));
    }
  };

  const updateProduct = async (id: string, updates: Partial<ProductFormInput>): Promise<void> => {
    try {
      await apiService.updateProduct(id, {
        name: updates.name,
        price: updates.price?.toString(),
        categoryId: updates.categoryId,
        supplierId: updates.supplierId || undefined,
      });
      await refreshData();
    } catch (error) {
      console.error('Failed to update product:', error);
      throw new Error(getErrorMessage(error, 'Failed to update product.'));
    }
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id'>): Promise<void> => {
    try {
      await apiService.createSupplier({
        name: supplier.name,
        contactInfo: supplier.contact,
        address: supplier.address,
      });
      await refreshData();
    } catch (error) {
      console.error('Failed to add supplier:', error);
    }
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>): Promise<void> => {
    try {
      await apiService.updateSupplier(id, {
        name: updates.name,
        contactInfo: updates.contact,
        address: updates.address,
      });
      await refreshData();
    } catch (error) {
      console.error('Failed to update supplier:', error);
    }
  };

  const addCategory = async (name: string): Promise<void> => {
    try {
      await apiService.createCategory({ name });
      await refreshData();
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };

  const updateCategory = async (id: string, name: string): Promise<void> => {
    try {
      await apiService.updateCategory(id, { name });
      await refreshData();
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const toggleCategoryStatus = async (id: string): Promise<void> => {
    try {
      await apiService.toggleCategoryStatus(id);
      await refreshData();
    } catch (error) {
      console.error('Failed to toggle category status:', error);
    }
  };

  const addStockMovement = async (movement: Omit<StockMovement, 'id'>): Promise<void> => {
    try {
      await apiService.recordStockMovement({
        productId: movement.productId,
        quantity: movement.quantity,
        type: movement.type === 'IN' ? 'STOCK_IN' : 'STOCK_OUT',
        notes: movement.notes,
      });
      await refreshData();
    } catch (error) {
      console.error('Failed to add stock movement:', error);
    }
  };

  const addPurchaseOrder = async (po: Omit<PurchaseOrder, 'id'>): Promise<void> => {
    try {
      await apiService.createPurchaseOrder({
        supplierId: po.supplierId,
        items: po.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      await refreshData();
    } catch (error) {
      console.error('Failed to add purchase order:', error);
    }
  };

  const completePurchaseOrder = async (id: string): Promise<void> => {
    try {
      const po = purchaseOrders.find(p => p.id === id);
      if (!po || po.status === 'Completed') return;

      await apiService.completePurchaseOrder(id, {
        items: po.items.map(item => ({
          productId: item.productId,
          receivedQty: item.quantity,
        })),
      });
      await refreshData();
    } catch (error) {
      console.error('Failed to complete purchase order:', error);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        suppliers,
        categories,
        stockMovements,
        purchaseOrders,
        loading,
        addProduct,
        updateProduct,
        addSupplier,
        updateSupplier,
        addCategory,
        updateCategory,
        toggleCategoryStatus,
        addStockMovement,
        addPurchaseOrder,
        completePurchaseOrder,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}
