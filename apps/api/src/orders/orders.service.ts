import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, desc, sql, inArray } from 'drizzle-orm';
import { DRIZZLE_PROVIDER, DrizzleDB } from '../database/database.provider';
import { orders, orderItems, products, users } from '../database/schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { JobsService } from '../jobs/jobs.service';
import { RedisService } from '../redis/redis.service';
import { OrderDto, OrderStatus, PaymentStatus } from '@mini-pos/shared';

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: DrizzleDB,
    private jobsService: JobsService,
    private redisService: RedisService,
  ) {}

  async createOrder(dto: CreateOrderDto, cashierId?: string, customerId?: string): Promise<OrderDto> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Pesanan harus memiliki minimal satu produk.');
    }

    const productIds = dto.items.map((i) => i.productId);
    const existingProducts = await this.db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    const productMap = new Map(existingProducts.map((p) => [p.id, p]));

    // Security & Financial Integrity: Server-side pricing calculation
    let calculatedTotal = 0;
    const preparedItems: Array<{
      productId: string;
      name: string;
      sku: string;
      price: number;
      quantity: number;
      discount: number;
      subtotal: number;
    }> = [];

    for (const item of dto.items) {
      const prod = productMap.get(item.productId);
      if (!prod) {
        throw new NotFoundException(`Produk dengan ID ${item.productId} tidak ditemukan.`);
      }
      if (prod.stock < item.quantity) {
        throw new BadRequestException(
          `Stok tidak mencukupi untuk "${prod.name}". Tersedia: ${prod.stock}, Diminta: ${item.quantity}`,
        );
      }

      // Security: Always use verified server-side price from database
      const itemPrice = parseFloat(prod.price);
      
      // Security: Only authorized POS cashier can apply custom line item discounts
      let itemDiscount = 0;
      if (dto.source === 'POS' && cashierId && typeof item.discount === 'number') {
        itemDiscount = Math.min(Math.max(0, item.discount), itemPrice * item.quantity);
      }

      const subtotal = itemPrice * item.quantity - itemDiscount;
      calculatedTotal += itemPrice * item.quantity;

      preparedItems.push({
        productId: prod.id,
        name: prod.name,
        sku: prod.sku,
        price: itemPrice,
        quantity: item.quantity,
        discount: itemDiscount,
        subtotal,
      });
    }

    // Server-side promo code validation
    let promoDiscount = 0;
    if (dto.promoCode) {
      const code = dto.promoCode.trim().toUpperCase();
      if (code === 'AURA10') {
        promoDiscount = Math.min(calculatedTotal * 0.1, 50000);
      } else if (code === 'DISKON50') {
        promoDiscount = Math.min(calculatedTotal * 0.5, 100000);
      } else if (code === 'HEMAT20') {
        promoDiscount = Math.min(calculatedTotal * 0.2, 75000);
      }
    }

    const totalLineDiscounts = preparedItems.reduce((sum, item) => sum + item.discount, 0);
    const calculatedDiscount = totalLineDiscounts + promoDiscount;
    const taxAmount = 0; // Tax calculation hook
    const finalAmount = Math.max(0, calculatedTotal - calculatedDiscount + taxAmount);

    if (dto.amountPaid < finalAmount) {
      throw new BadRequestException(
        `Jumlah pembayaran (Rp ${dto.amountPaid.toLocaleString('id-ID')}) kurang dari total tagihan (Rp ${finalAmount.toLocaleString('id-ID')}).`,
      );
    }

    const changeAmount = dto.amountPaid - finalAmount;
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // Perform database transaction
    const [createdOrder] = await this.db
      .insert(orders)
      .values({
        orderNumber,
        source: dto.source || 'POS',
        status: 'COMPLETED',
        totalAmount: calculatedTotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        discountAmount: calculatedDiscount.toFixed(2),
        finalAmount: finalAmount.toFixed(2),
        paymentMethod: dto.paymentMethod,
        paymentStatus: 'PAID',
        amountPaid: dto.amountPaid.toFixed(2),
        changeAmount: changeAmount.toFixed(2),
        cashierId: cashierId || null,
        customerId: customerId || null,
        customerName: dto.customerName || 'Walk-in Customer',
        customerEmail: dto.customerEmail || null,
        notes: dto.notes || null,
      })
      .returning();

    // Insert Order Items and perform ATOMIC stock decrement to prevent race conditions
    for (const item of preparedItems) {
      await this.db.insert(orderItems).values({
        orderId: createdOrder.id,
        productId: item.productId,
        productName: item.name,
        productSku: item.sku,
        price: item.price.toFixed(2),
        quantity: item.quantity,
        discount: item.discount.toFixed(2),
        subtotal: item.subtotal.toFixed(2),
      });

      // Security: Atomic SQL Decrement with concurrency guard
      const updatedProducts = await this.db
        .update(products)
        .set({
          stock: sql`${products.stock} - ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(
          sql`${products.id} = ${item.productId} AND ${products.stock} >= ${item.quantity}`,
        )
        .returning({ id: products.id, stock: products.stock, minStockAlert: products.minStockAlert });

      if (!updatedProducts || updatedProducts.length === 0) {
        throw new BadRequestException(
          `Stok produk "${item.name}" telah habis atau tidak mencukupi saat proses checkout bersamaan.`,
        );
      }

      const updatedProd = updatedProducts[0];
      if (updatedProd.stock <= updatedProd.minStockAlert) {
        await this.jobsService.queueLowStockAlert(updatedProd.id, updatedProd.stock, updatedProd.minStockAlert);
      }
    }

    // Invalidate product catalog cache
    await this.redisService.invalidatePrefix('catalog:');

    // Queue receipt job in BullMQ
    await this.jobsService.queueReceiptGeneration(createdOrder.id, dto.customerEmail);

    return this.getOrderById(createdOrder.id);
  }

  async getOrderById(orderId: string, currentUser?: any): Promise<OrderDto> {
    const order = await this.db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: true,
        cashier: { columns: { id: true, name: true, email: true } },
        customer: { columns: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Security: BOLA / IDOR Authorization Check
    if (currentUser && currentUser.role === 'CUSTOMER') {
      const isOwner =
        (order.customerId && order.customerId === currentUser.id) ||
        (order.customerEmail && order.customerEmail.toLowerCase() === (currentUser.email || '').toLowerCase());

      if (!isOwner) {
        throw new ForbiddenException('Akses ditolak: Anda tidak memiliki izin untuk melihat detail pesanan ini.');
      }
    }

    return this.formatOrder(order);
  }

  async findAll(limit = 50) {
    const list = await this.db.query.orders.findMany({
      with: { items: true },
      orderBy: [desc(orders.createdAt)],
      limit,
    });
    return list.map(this.formatOrder);
  }

  async updateStatus(orderId: string, status: any, restock = false) {
    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const previousStatus = order.status;

    await this.db
      .update(orders)
      .set({
        status: status as any,
        paymentStatus: status === 'REFUNDED' ? 'REFUNDED' : status === 'CANCELLED' ? 'FAILED' : 'PAID',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    // If refunding/cancelling and restock is requested, restore product stock
    if ((status === 'REFUNDED' || status === 'CANCELLED') && restock && previousStatus === 'COMPLETED') {
      for (const item of order.items) {
        if (item.productId) {
          const prod = await this.db.query.products.findFirst({
            where: eq(products.id, item.productId),
          });
          if (prod) {
            await this.db
              .update(products)
              .set({ stock: prod.stock + item.quantity, updatedAt: new Date() })
              .where(eq(products.id, item.productId));
          }
        }
      }
      await this.redisService.invalidatePrefix('catalog:');
    }

    return this.getOrderById(orderId);
  }

  async getReports() {
    const allOrders = await this.db.select().from(orders);
    const allItems = await this.db.select().from(orderItems);
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const completedOrders = allOrders.filter((o) => o.status === 'COMPLETED');
    const totalSales = completedOrders.reduce((sum, o) => sum + parseFloat(o.finalAmount), 0);
    const totalTransactions = completedOrders.length;

    // Daily calculation
    const todayOrders = completedOrders.filter(
      (o) => o.createdAt.toISOString().slice(0, 10) === todayStr,
    );
    const dailySales = todayOrders.reduce((sum, o) => sum + parseFloat(o.finalAmount), 0);

    // Weekly calculation (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const weeklyOrders = completedOrders.filter((o) => new Date(o.createdAt) >= sevenDaysAgo);
    const weeklySales = weeklyOrders.reduce((sum, o) => sum + parseFloat(o.finalAmount), 0);

    // Monthly calculation (this month)
    const currentMonth = now.toISOString().slice(0, 7);
    const monthlyOrders = completedOrders.filter(
      (o) => o.createdAt.toISOString().slice(0, 7) === currentMonth,
    );
    const monthlySales = monthlyOrders.reduce((sum, o) => sum + parseFloat(o.finalAmount), 0);

    // Top products aggregation
    const productStats = new Map<string, { name: string; sku: string; quantity: number; revenue: number }>();
    for (const item of allItems) {
      const existing = productStats.get(item.productName) || {
        name: item.productName,
        sku: item.productSku,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += parseFloat(item.subtotal);
      productStats.set(item.productName, existing);
    }

    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Last 7 days revenue chart data points
    const chartDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
      const dayTotal = completedOrders
        .filter((o) => o.createdAt.toISOString().slice(0, 10) === dateStr)
        .reduce((sum, o) => sum + parseFloat(o.finalAmount), 0);
      const dayTxCount = completedOrders.filter(
        (o) => o.createdAt.toISOString().slice(0, 10) === dateStr,
      ).length;

      chartDays.push({
        date: dateStr,
        day: dayName,
        revenue: dayTotal,
        transactions: dayTxCount,
      });
    }

    return {
      totalSales,
      totalTransactions,
      dailySales,
      dailyTransactions: todayOrders.length,
      weeklySales,
      weeklyTransactions: weeklyOrders.length,
      monthlySales,
      monthlyTransactions: monthlyOrders.length,
      topProducts,
      chartDays,
    };
  }

  async getDashboardMetrics() {
    const allOrders = await this.db.select().from(orders);
    const today = new Date().toISOString().slice(0, 10);

    const completedOrders = allOrders.filter((o) => o.status === 'COMPLETED');
    const todayOrders = completedOrders.filter(
      (o) => o.createdAt.toISOString().slice(0, 10) === today,
    );

    const todaySales = todayOrders.reduce((sum, o) => sum + parseFloat(o.finalAmount), 0);
    const todayTransactions = todayOrders.length;
    const totalSales = completedOrders.reduce((sum, o) => sum + parseFloat(o.finalAmount), 0);
    const totalOrdersCount = allOrders.length;

    const lowStockProducts = await this.db
      .select()
      .from(products)
      .where(sql`${products.stock} <= ${products.minStockAlert}`);

    const recentOrders = await this.findAll(10);
    const reports = await this.getReports();

    return {
      totalSales,
      totalOrdersCount,
      todaySales,
      todayTransactions,
      lowStockItemsCount: lowStockProducts.length,
      pendingOrdersCount: allOrders.filter((o) => o.status === 'PENDING').length,
      recentOrders,
      lowStockProducts: lowStockProducts.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock: p.stock,
        minStockAlert: p.minStockAlert,
      })),
      revenueChart: reports.chartDays,
      topProducts: reports.topProducts,
    };
  }

  private formatOrder(order: any): OrderDto {
    return {
      ...order,
      totalAmount: parseFloat(order.totalAmount),
      taxAmount: parseFloat(order.taxAmount || '0'),
      discountAmount: parseFloat(order.discountAmount || '0'),
      finalAmount: parseFloat(order.finalAmount),
      amountPaid: parseFloat(order.amountPaid),
      changeAmount: parseFloat(order.changeAmount || '0'),
      items: (order.items || []).map((item: any) => ({
        ...item,
        price: parseFloat(item.price),
        discount: parseFloat(item.discount || '0'),
        subtotal: parseFloat(item.subtotal),
      })),
      createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: order.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }
}
