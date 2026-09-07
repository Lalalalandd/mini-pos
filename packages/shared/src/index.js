"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrderSchema = exports.CartItemSchema = exports.UpdateProductSchema = exports.CreateProductSchema = exports.CreateCategorySchema = exports.RefreshTokenSchema = exports.RegisterSchema = exports.LoginSchema = exports.ProductStatus = exports.PaymentStatus = exports.PaymentMethod = exports.OrderSource = exports.OrderStatus = exports.ROLES_ARRAY = exports.Role = void 0;
const zod_1 = require("zod");
var Role;
(function (Role) {
    Role["ADMIN"] = "ADMIN";
    Role["CASHIER"] = "CASHIER";
    Role["CUSTOMER"] = "CUSTOMER";
})(Role || (exports.Role = Role = {}));
exports.ROLES_ARRAY = [Role.ADMIN, Role.CASHIER, Role.CUSTOMER];
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["PAID"] = "PAID";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["REFUNDED"] = "REFUNDED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var OrderSource;
(function (OrderSource) {
    OrderSource["POS"] = "POS";
    OrderSource["ECOMMERCE"] = "ECOMMERCE";
})(OrderSource || (exports.OrderSource = OrderSource = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["QRIS"] = "QRIS";
    PaymentMethod["DEBIT_CARD"] = "DEBIT_CARD";
    PaymentMethod["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentMethod["E_WALLET"] = "E_WALLET";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["UNPAID"] = "UNPAID";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["DRAFT"] = "DRAFT";
    ProductStatus["ACTIVE"] = "ACTIVE";
    ProductStatus["ARCHIVED"] = "ARCHIVED";
    ProductStatus["OUT_OF_STOCK"] = "OUT_OF_STOCK";
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please enter a valid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
});
exports.RegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Please enter a valid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    role: zod_1.z.nativeEnum(Role).default(Role.CUSTOMER),
});
exports.RefreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.CreateCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Category name must be at least 2 characters'),
    slug: zod_1.z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case'),
    description: zod_1.z.string().optional(),
});
exports.CreateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Product name is required'),
    sku: zod_1.z.string().min(3, 'SKU must be at least 3 characters'),
    barcode: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    price: zod_1.z.number().positive('Price must be greater than zero'),
    costPrice: zod_1.z.number().nonnegative('Cost price cannot be negative').default(0),
    stock: zod_1.z.number().int().nonnegative('Stock cannot be negative').default(0),
    minStockAlert: zod_1.z.number().int().nonnegative().default(5),
    categoryId: zod_1.z.string().uuid('Invalid Category ID'),
    status: zod_1.z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
    imageUrl: zod_1.z.string().url().optional(),
});
exports.UpdateProductSchema = exports.CreateProductSchema.partial();
exports.CartItemSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    sku: zod_1.z.string(),
    name: zod_1.z.string(),
    price: zod_1.z.number().positive(),
    quantity: zod_1.z.number().int().positive(),
    discount: zod_1.z.number().nonnegative().default(0),
});
exports.CreateOrderSchema = zod_1.z.object({
    source: zod_1.z.nativeEnum(OrderSource),
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().uuid(),
        quantity: zod_1.z.number().int().positive('Quantity must be at least 1'),
        price: zod_1.z.number().positive(),
        discount: zod_1.z.number().nonnegative().default(0),
    })).min(1, 'Order must contain at least one item'),
    customerName: zod_1.z.string().optional(),
    customerEmail: zod_1.z.string().email().optional(),
    customerPhone: zod_1.z.string().optional(),
    paymentMethod: zod_1.z.nativeEnum(PaymentMethod),
    amountPaid: zod_1.z.number().nonnegative(),
    notes: zod_1.z.string().optional(),
});
//# sourceMappingURL=index.js.map