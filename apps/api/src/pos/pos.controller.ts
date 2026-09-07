import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from '../orders/orders.service';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@mini-pos/shared';

@ApiTags('POS')
@Controller('pos')
export class PosController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CASHIER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process in-store POS instant sale (Cashier / Admin)' })
  async checkout(@Body() dto: CreateOrderDto, @CurrentUser('id') cashierId: string) {
    return this.ordersService.createOrder(dto, cashierId, undefined);
  }
}
