const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

interface ApiErrorResponse {
    error?: string;
    message?: string;
}

export interface ApiCategory {
    id: string;
    name: string;
    isActive: boolean;
}

export interface ApiSupplier {
    id: string;
    name: string;
    contactInfo: string | null;
    address: string | null;
}

export interface ApiProductWithStock {
    id: string;
    name: string;
    barcode: string;
    price: string;
    category: ApiCategory;
    supplier: ApiSupplier | null;
    currentStock: number;
}

export interface ApiStockMovement {
    id: string;
    productId: string;
    quantity: number;
    type: "STOCK_IN" | "STOCK_OUT";
    notes: string | null;
    date: string;
    product: {
        id: string;
        name: string;
    };
}

export interface ApiPurchaseOrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    receivedQty: number;
    product: {
        id: string;
        name: string;
    };
}

export interface ApiPurchaseOrder {
    id: string;
    supplierId: string;
    status: "PENDING" | "COMPLETED";
    createdAt: string;
    supplier: ApiSupplier;
    items: ApiPurchaseOrderItem[];
}

class ApiService {
    private token: string | null = null;

    setToken(token: string) {
        this.token = token;
        localStorage.setItem("token", token);
    }

    getToken() {
        if (!this.token) {
            this.token = localStorage.getItem("token");
        }
        return this.token;
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem("token");
    }

    private getHeaders() {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        const token = this.getToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return headers;
    }

    private async request<T>(
        endpoint: string,
        method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
        body?: unknown
    ): Promise<T> {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers: this.getHeaders(),
            body: body ? JSON.stringify(body) : undefined,
        });

        const responseText = await response.text();
        let payload: ApiResponse<T> | undefined;

        if (responseText) {
            try {
                payload = JSON.parse(responseText) as ApiResponse<T>;
            } catch {
                payload = undefined;
            }
        }

        if (!response.ok) {
            if (response.status === 401) {
                this.clearToken();
                window.location.href = "/login";
            }

            const errorBody = payload as ApiErrorResponse | undefined;
            throw new Error(errorBody?.error || errorBody?.message || `API Error: ${response.statusText}`);
        }

        if (!payload) {
            throw new Error("Invalid API response");
        }

        if (!payload.success) {
            throw new Error(payload.error || "Request failed");
        }

        return payload.data as T;
    }

    // Auth
    async login(email: string, password: string): Promise<{ token: string }> {
        return this.request("/auth/login", "POST", { email, password });
    }

    async getMe(): Promise<unknown> {
        return this.request("/auth/me");
    }

    // Products
    async getProducts(): Promise<ApiProductWithStock[]> {
        return this.request("/products");
    }

    async getProductsWithStock(): Promise<ApiProductWithStock[]> {
        return this.request("/products/with-stock");
    }

    async getLowStockProducts(threshold?: number): Promise<ApiProductWithStock[]> {
        const query = threshold ? `?threshold=${threshold}` : "";
        return this.request(`/products/low-stock${query}`);
    }

    async getOutOfStockProducts(): Promise<ApiProductWithStock[]> {
        return this.request("/products/out-of-stock");
    }

    async getProductById(id: string): Promise<ApiProductWithStock> {
        return this.request(`/products/${id}`);
    }

    async createProduct(data: unknown): Promise<unknown> {
        return this.request("/products", "POST", data);
    }

    async updateProduct(id: string, data: unknown): Promise<unknown> {
        return this.request(`/products/${id}`, "PUT", data);
    }

    async deleteProduct(id: string): Promise<unknown> {
        return this.request(`/products/${id}`, "DELETE");
    }

    // Stock
    async recordStockMovement(data: unknown): Promise<unknown> {
        return this.request("/stock", "POST", data);
    }

    async getStockMovements(productId: string): Promise<ApiStockMovement[]> {
        return this.request(`/stock/movements/${productId}`);
    }

    async getRecentStockActivity(days?: number): Promise<ApiStockMovement[]> {
        const query = days ? `?days=${days}` : "";
        return this.request(`/stock/activity/recent${query}`);
    }

    async getTotalStockValue(): Promise<number> {
        return this.request("/stock/value/total");
    }

    // Suppliers
    async getSuppliers(): Promise<ApiSupplier[]> {
        return this.request("/suppliers");
    }

    async getSupplierById(id: string): Promise<ApiSupplier> {
        return this.request(`/suppliers/${id}`);
    }

    async createSupplier(data: unknown): Promise<unknown> {
        return this.request("/suppliers", "POST", data);
    }

    async updateSupplier(id: string, data: unknown): Promise<unknown> {
        return this.request(`/suppliers/${id}`, "PUT", data);
    }

    async deleteSupplier(id: string): Promise<unknown> {
        return this.request(`/suppliers/${id}`, "DELETE");
    }

    // Categories
    async getCategories(): Promise<ApiCategory[]> {
        return this.request("/categories");
    }

    async getCategoryById(id: string): Promise<ApiCategory> {
        return this.request(`/categories/${id}`);
    }

    async createCategory(data: unknown): Promise<unknown> {
        return this.request("/categories", "POST", data);
    }

    async updateCategory(id: string, data: unknown): Promise<unknown> {
        return this.request(`/categories/${id}`, "PUT", data);
    }

    async toggleCategoryStatus(id: string): Promise<unknown> {
        return this.request(`/categories/${id}`, "DELETE");
    }

    // Purchase Orders
    async createPurchaseOrder(data: unknown): Promise<unknown> {
        return this.request("/purchase-orders", "POST", data);
    }

    async getPurchaseOrders(): Promise<ApiPurchaseOrder[]> {
        return this.request("/purchase-orders");
    }

    async getPurchaseOrderById(id: string): Promise<ApiPurchaseOrder> {
        return this.request(`/purchase-orders/${id}`);
    }

    async completePurchaseOrder(id: string, data: unknown): Promise<unknown> {
        return this.request(`/purchase-orders/${id}/complete`, "POST", data);
    }

    async getPendingPurchaseOrders(): Promise<ApiPurchaseOrder[]> {
        return this.request("/purchase-orders/pending");
    }
}

export const apiService = new ApiService();
