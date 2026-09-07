import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Min } from 'class-validator';
import { ProductStatus } from '@mini-pos/shared';

export class CreateProductDto {
  @ApiProperty({ example: 'Iced Oat Caramel Macchiato' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'BEV-MAC-002' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: '899100100002', required: false })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({ example: 'Creamy oat milk layered with rich espresso and house caramel syrup', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 38000 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 18000, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number = 0;

  @ApiProperty({ example: 85, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number = 0;

  @ApiProperty({ example: 10, default: 5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minStockAlert?: number = 5;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ enum: ProductStatus, default: ProductStatus.ACTIVE })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus = ProductStatus.ACTIVE;

  @ApiProperty({ example: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class UpdateProductDto extends CreateProductDto {}
