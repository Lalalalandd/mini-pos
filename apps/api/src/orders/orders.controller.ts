import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
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

  @Get('reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detailed sales and product performance reports (Admin only)' })
  async getReports() {
    return this.ordersService.getReports();
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
  @ApiOperation({ summary: 'Get order details by ID (Owner, Admin, or Cashier)' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.getOrderById(id, user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status / refund order (Admin only)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: any,
    @Body('restock') restock?: boolean,
  ) {
    return this.ordersService.updateStatus(id, status, restock);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create online ecommerce order' })
  async createOrder(@Body() dto: CreateOrderDto, @CurrentUser('id') customerId: string) {
    return this.ordersService.createOrder(dto, undefined, customerId);
  }
}
