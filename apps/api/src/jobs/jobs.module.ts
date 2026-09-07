import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JobsService, RECEIPT_QUEUE, STOCK_ALERT_QUEUE } from './jobs.service';
import { ReceiptProcessor } from './processors/receipt.processor';
import { StockAlertProcessor } from './processors/stock-alert.processor';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
        },
      }),
    }),
    BullModule.registerQueue(
      { name: RECEIPT_QUEUE },
      { name: STOCK_ALERT_QUEUE },
    ),
  ],
  providers: [JobsService, ReceiptProcessor, StockAlertProcessor],
  exports: [JobsService],
})
export class JobsModule {}
