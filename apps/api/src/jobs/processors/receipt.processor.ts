import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { RECEIPT_QUEUE } from '../jobs.service';

@Processor(RECEIPT_QUEUE)
export class ReceiptProcessor extends WorkerHost {
  private readonly logger = new Logger(ReceiptProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing receipt generation job ${job.id} for order ${job.data.orderId}`);
    
    // Simulate invoice / PDF receipt computation and email notification dispatch
    await new Promise((resolve) => setTimeout(resolve, 500));

    this.logger.log(`Receipt successfully compiled for order ${job.data.orderId}`);
    return { success: true, receiptUrl: `/invoices/${job.data.orderId}.pdf` };
  }
}
