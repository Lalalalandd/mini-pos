import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PosController } from '../pos/pos.controller';

@Module({
  controllers: [OrdersController, PosController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
