import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@mini-pos/shared';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all registered users (Admin only)' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details by ID (Admin only)' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new user/cashier account (Admin only)' })
  async create(
    @Body() dto: { name: string; email: string; password?: string; role: Role },
  ) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user details or password (Admin only)' })
  async update(
    @Param('id') id: string,
    @Body() dto: { name?: string; email?: string; role?: Role; password?: string },
  ) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  async updateRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.usersService.updateRole(id, role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user account (Admin only)' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

