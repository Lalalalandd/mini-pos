import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { STOCK_ALERT_QUEUE } from '../jobs.service';

@Processor(STOCK_ALERT_QUEUE)
export class StockAlertProcessor extends WorkerHost {
  private readonly logger = new Logger(StockAlertProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    const { productId, currentStock, threshold } = job.data;
    this.logger.warn(
      `[STOCK ALERT] Product ID: ${productId} has reached low threshold! Current Stock: ${currentStock}, Alert Threshold: ${threshold}`,
    );

    // Simulate pushing alert notification to Admin dashboard / webhook
    await new Promise((resolve) => setTimeout(resolve, 200));

    return { alerted: true, productId, currentStock };
  }
}
