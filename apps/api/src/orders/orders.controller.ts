import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@mini-pos/shared';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CASHIER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all orders (Admin & Cashier)' })
  async findAll(@Query('limit') limit?: number) {
    return this.ordersService.findAll(limit ? Number(limit) : 50);
  }

  @Get('dashboard/metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get store overview and real-time dashboard metrics (Admin only)' })
  async getMetrics() {
    return this.ordersService.getDashboardMetrics();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order details by ID' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create online ecommerce order' })
  async createOrder(@Body() dto: CreateOrderDto, @CurrentUser('id') customerId: string) {
    return this.ordersService.createOrder(dto, undefined, customerId);
  }
}
