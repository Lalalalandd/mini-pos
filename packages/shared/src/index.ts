import { z } from 'zod';

// ==========================================
// 1. ROLES & PERMISSIONS
// ==========================================
export enum Role {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
  CUSTOMER = 'CUSTOMER',
}

export const ROLES_ARRAY = [Role.ADMIN, Role.CASHIER, Role.CUSTOMER] as const;

// ==========================================
// 2. ORDER & TRANSACTION ENUMS
// ==========================================
export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum OrderSource {
  POS = 'POS',
  ECOMMERCE = 'ECOMMERCE',
}

export enum PaymentMethod {
  CASH = 'CASH',
  QRIS = 'QRIS',
  DEBIT_CARD = 'DEBIT_CARD',
  CREDIT_CARD = 'CREDIT_CARD',
  E_WALLET = 'E_WALLET',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

// ==========================================
// 3. ZOD VALIDATION SCHEMAS
// ==========================================

// Auth Schemas
export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.nativeEnum(Role).default(Role.CUSTOMER),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

// Category Schemas
export const CreateCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case'),
  description: z.string().optional(),
});
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;

// Product Schemas
export const CreateProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  barcode: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than zero'),
  costPrice: z.number().nonnegative('Cost price cannot be negative').default(0),
  stock: z.number().int().nonnegative('Stock cannot be negative').default(0),
  minStockAlert: z.number().int().nonnegative().default(5),
  categoryId: z.string().uuid('Invalid Category ID'),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
  imageUrl: z.string().url().optional(),
});
export type CreateProductInput = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = CreateProductSchema.partial();
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

// Cart & POS Checkout Schemas
export const CartItemSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  discount: z.number().nonnegative().default(0),
});
export type CartItem = z.infer<typeof CartItemSchema>;

export const CreateOrderSchema = z.object({
  source: z.nativeEnum(OrderSource),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive('Quantity must be at least 1'),
      price: z.number().positive(),
      discount: z.number().nonnegative().default(0),
    })
  ).min(1, 'Order must contain at least one item'),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  amountPaid: z.number().nonnegative(),
  notes: z.string().optional(),
});
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// ==========================================
// 4. COMMON DATA INTERFACES & DTOs
// ==========================================

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
