import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export const RECEIPT_QUEUE = 'receipt-queue';
export const STOCK_ALERT_QUEUE = 'stock-alert-queue';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectQueue(RECEIPT_QUEUE) private receiptQueue: Queue,
    @InjectQueue(STOCK_ALERT_QUEUE) private stockAlertQueue: Queue,
  ) {}

  async queueReceiptGeneration(orderId: string, customerEmail?: string) {
    this.logger.log(`Enqueueing receipt generation for order: ${orderId}`);
    return this.receiptQueue.add('generate-receipt', {
      orderId,
      customerEmail,
      timestamp: new Date().toISOString(),
    });
  }

  async queueLowStockAlert(productId: string, currentStock: number, threshold: number) {
    this.logger.log(`Enqueueing low stock alert for product: ${productId} (Stock: ${currentStock})`);
    return this.stockAlertQueue.add('check-low-stock', {
      productId,
      currentStock,
      threshold,
      timestamp: new Date().toISOString(),
    });
  }
}
