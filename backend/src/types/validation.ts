import { z } from "zod";

// Auth
export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export type LoginRequest = z.infer<typeof LoginSchema>;

export const AuthResponseSchema = z.object({
    token: z.string(),
    user: z.object({
        id: z.string(),
        email: z.string(),
        name: z.string(),
        role: z.string(),
    }),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Product
export const CreateProductSchema = z.object({
    name: z.string().min(1),
    barcode: z.string().min(1),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/),
    categoryId: z.string().min(1),
    supplierId: z.string().optional().nullable(),
});

export type CreateProductRequest = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = CreateProductSchema.partial();

export type UpdateProductRequest = z.infer<typeof UpdateProductSchema>;

// Stock Movement
export const CreateStockMovementSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
    type: z.enum(["STOCK_IN", "STOCK_OUT"]),
    notes: z.string().optional(),
});

export type CreateStockMovementRequest = z.infer<
    typeof CreateStockMovementSchema
>;

// Supplier
export const CreateSupplierSchema = z.object({
    name: z.string().min(1),
    contactInfo: z.string().optional(),
    address: z.string().optional(),
});

export type CreateSupplierRequest = z.infer<typeof CreateSupplierSchema>;

export const UpdateSupplierSchema = CreateSupplierSchema.partial();

export type UpdateSupplierRequest = z.infer<typeof UpdateSupplierSchema>;

// Category
export const CreateCategorySchema = z.object({
    name: z.string().min(1),
});

export type CreateCategoryRequest = z.infer<typeof CreateCategorySchema>;

// Purchase Order
export const CreatePurchaseOrderItemSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
});

export const CreatePurchaseOrderSchema = z.object({
    supplierId: z.string().min(1),
    items: z.array(CreatePurchaseOrderItemSchema).min(1),
});

export type CreatePurchaseOrderRequest = z.infer<
    typeof CreatePurchaseOrderSchema
>;

export const CompletePurchaseOrderSchema = z.object({
    items: z.array(
        z.object({
            productId: z.string(),
            receivedQty: z.number().int().nonnegative(),
        })
    ),
});

export type CompletePurchaseOrderRequest = z.infer<
    typeof CompletePurchaseOrderSchema
>;

// POS Sale
export const CheckoutSaleItemSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
});

export const CheckoutSaleSchema = z.object({
    items: z.array(CheckoutSaleItemSchema).min(1),
    paymentMethod: z.literal("CASH").default("CASH"),
    paidAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
    customerName: z.string().trim().min(1).optional(),
});

export type CheckoutSaleRequest = z.infer<typeof CheckoutSaleSchema>;
