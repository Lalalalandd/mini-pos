import { z } from 'zod';
export declare enum Role {
    ADMIN = "ADMIN",
    CASHIER = "CASHIER",
    CUSTOMER = "CUSTOMER"
}
export declare const ROLES_ARRAY: readonly [Role.ADMIN, Role.CASHIER, Role.CUSTOMER];
export declare enum OrderStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED"
}
export declare enum OrderSource {
    POS = "POS",
    ECOMMERCE = "ECOMMERCE"
}
export declare enum PaymentMethod {
    CASH = "CASH",
    QRIS = "QRIS",
    DEBIT_CARD = "DEBIT_CARD",
    CREDIT_CARD = "CREDIT_CARD",
    E_WALLET = "E_WALLET",
    BANK_TRANSFER = "BANK_TRANSFER"
}
export declare enum PaymentStatus {
    UNPAID = "UNPAID",
    PAID = "PAID",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare enum ProductStatus {
    DRAFT = "DRAFT",
    ACTIVE = "ACTIVE",
    ARCHIVED = "ARCHIVED",
    OUT_OF_STOCK = "OUT_OF_STOCK"
}
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginInput = z.infer<typeof LoginSchema>;
export declare const RegisterSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodNativeEnum<typeof Role>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
    role: Role;
}, {
    email: string;
    password: string;
    name: string;
    role?: Role | undefined;
}>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export declare const RefreshTokenSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export declare const CreateCategorySchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    description?: string | undefined;
}, {
    name: string;
    slug: string;
    description?: string | undefined;
}>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export declare const CreateProductSchema: z.ZodObject<{
    name: z.ZodString;
    sku: z.ZodString;
    barcode: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    costPrice: z.ZodDefault<z.ZodNumber>;
    stock: z.ZodDefault<z.ZodNumber>;
    minStockAlert: z.ZodDefault<z.ZodNumber>;
    categoryId: z.ZodString;
    status: z.ZodDefault<z.ZodNativeEnum<typeof ProductStatus>>;
    imageUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: ProductStatus;
    name: string;
    sku: string;
    price: number;
    costPrice: number;
    stock: number;
    minStockAlert: number;
    categoryId: string;
    description?: string | undefined;
    barcode?: string | undefined;
    imageUrl?: string | undefined;
}, {
    name: string;
    sku: string;
    price: number;
    categoryId: string;
    status?: ProductStatus | undefined;
    description?: string | undefined;
    barcode?: string | undefined;
    costPrice?: number | undefined;
    stock?: number | undefined;
    minStockAlert?: number | undefined;
    imageUrl?: string | undefined;
}>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export declare const UpdateProductSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    sku: z.ZodOptional<z.ZodString>;
    barcode: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    price: z.ZodOptional<z.ZodNumber>;
    costPrice: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    stock: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    minStockAlert: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    categoryId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodDefault<z.ZodNativeEnum<typeof ProductStatus>>>;
    imageUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status?: ProductStatus | undefined;
    name?: string | undefined;
    description?: string | undefined;
    sku?: string | undefined;
    barcode?: string | undefined;
    price?: number | undefined;
    costPrice?: number | undefined;
    stock?: number | undefined;
    minStockAlert?: number | undefined;
    categoryId?: string | undefined;
    imageUrl?: string | undefined;
}, {
    status?: ProductStatus | undefined;
    name?: string | undefined;
    description?: string | undefined;
    sku?: string | undefined;
    barcode?: string | undefined;
    price?: number | undefined;
    costPrice?: number | undefined;
    stock?: number | undefined;
    minStockAlert?: number | undefined;
    categoryId?: string | undefined;
    imageUrl?: string | undefined;
}>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export declare const CartItemSchema: z.ZodObject<{
    productId: z.ZodString;
    sku: z.ZodString;
    name: z.ZodString;
    price: z.ZodNumber;
    quantity: z.ZodNumber;
    discount: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    sku: string;
    price: number;
    productId: string;
    quantity: number;
    discount: number;
}, {
    name: string;
    sku: string;
    price: number;
    productId: string;
    quantity: number;
    discount?: number | undefined;
}>;
export type CartItem = z.infer<typeof CartItemSchema>;
export declare const CreateOrderSchema: z.ZodObject<{
    source: z.ZodNativeEnum<typeof OrderSource>;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
        price: z.ZodNumber;
        discount: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        price: number;
        productId: string;
        quantity: number;
        discount: number;
    }, {
        price: number;
        productId: string;
        quantity: number;
        discount?: number | undefined;
    }>, "many">;
    customerName: z.ZodOptional<z.ZodString>;
    customerEmail: z.ZodOptional<z.ZodString>;
    customerPhone: z.ZodOptional<z.ZodString>;
    paymentMethod: z.ZodNativeEnum<typeof PaymentMethod>;
    amountPaid: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    source: OrderSource;
    items: {
        price: number;
        productId: string;
        quantity: number;
        discount: number;
    }[];
    paymentMethod: PaymentMethod;
    amountPaid: number;
    customerName?: string | undefined;
    customerEmail?: string | undefined;
    customerPhone?: string | undefined;
    notes?: string | undefined;
}, {
    source: OrderSource;
    items: {
        price: number;
        productId: string;
        quantity: number;
        discount?: number | undefined;
    }[];
    paymentMethod: PaymentMethod;
    amountPaid: number;
    customerName?: string | undefined;
    customerEmail?: string | undefined;
    customerPhone?: string | undefined;
    notes?: string | undefined;
}>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export interface UserDto {
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt: string;
    updatedAt: string;
}
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: UserDto;
}
export interface CategoryDto {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface ProductDto {
    id: string;
    name: string;
    sku: string;
    barcode?: string | null;
    description?: string | null;
    price: number;
    costPrice: number;
    stock: number;
    minStockAlert: number;
    categoryId: string;
    category?: CategoryDto | null;
    status: ProductStatus;
    imageUrl?: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface OrderItemDto {
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    productSku: string;
    price: number;
    quantity: number;
    discount: number;
    subtotal: number;
}
export interface OrderDto {
    id: string;
    orderNumber: string;
    source: OrderSource;
    status: OrderStatus;
    totalAmount: number;
    taxAmount: number;
    discountAmount: number;
    finalAmount: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    amountPaid: number;
    changeAmount: number;
    cashierId?: string | null;
    customerId?: string | null;
    customerName?: string | null;
    customerEmail?: string | null;
    items: OrderItemDto[];
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
}
export interface DashboardMetricsDto {
    todaySales: number;
    todayTransactions: number;
    lowStockItemsCount: number;
    pendingOrdersCount: number;
    recentOrders: OrderDto[];
    topSellingProducts: {
        productId: string;
        productName: string;
        quantitySold: number;
        totalRevenue: number;
    }[];
}
