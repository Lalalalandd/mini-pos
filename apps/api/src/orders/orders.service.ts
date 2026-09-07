import {
  BadRequestException,
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
      throw new BadRequestException('Order must contain at least one item');
    }

    const productIds = dto.items.map((i) => i.productId);
    const existingProducts = await this.db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    const productMap = new Map(existingProducts.map((p) => [p.id, p]));

    // Validate stock and prepare items
    let calculatedTotal = 0;
    let calculatedDiscount = 0;

    for (const item of dto.items) {
      const prod = productMap.get(item.productId);
      if (!prod) {
        throw new NotFoundException(`Product with ID ${item.productId} was not found`);
      }
      if (prod.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${prod.name}". Available: ${prod.stock}, Requested: ${item.quantity}`,
        );
      }

      const itemPrice = parseFloat(prod.price);
      const itemDiscount = item.discount || 0;
      const subtotal = itemPrice * item.quantity - itemDiscount;

      calculatedTotal += itemPrice * item.quantity;
      calculatedDiscount += itemDiscount;
    }

    const taxAmount = 0; // Tax calculation hook
    const finalAmount = calculatedTotal - calculatedDiscount + taxAmount;

    if (dto.amountPaid < finalAmount) {
      throw new BadRequestException(
        `Amount paid (${dto.amountPaid}) is less than final amount (${finalAmount})`,
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

    // Insert Order Items and decrement stock
    for (const item of dto.items) {
      const prod = productMap.get(item.productId)!;
      const itemPrice = parseFloat(prod.price);
      const itemDiscount = item.discount || 0;
      const subtotal = itemPrice * item.quantity - itemDiscount;

      await this.db.insert(orderItems).values({
        orderId: createdOrder.id,
        productId: prod.id,
        productName: prod.name,
        productSku: prod.sku,
        price: itemPrice.toFixed(2),
        quantity: item.quantity,
        discount: itemDiscount.toFixed(2),
        subtotal: subtotal.toFixed(2),
      });

      const newStock = prod.stock - item.quantity;
      await this.db
        .update(products)
        .set({ stock: newStock, updatedAt: new Date() })
        .where(eq(products.id, prod.id));

      if (newStock <= prod.minStockAlert) {
        await this.jobsService.queueLowStockAlert(prod.id, newStock, prod.minStockAlert);
      }
    }

    // Invalidate product catalog cache
    await this.redisService.invalidatePrefix('catalog:');

    // Queue receipt job in BullMQ
    await this.jobsService.queueReceiptGeneration(createdOrder.id, dto.customerEmail);

    return this.getOrderById(createdOrder.id);
  }

  async getOrderById(orderId: string): Promise<OrderDto> {
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
