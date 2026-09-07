import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { OrderSource, PaymentMethod } from '@mini-pos/shared';

export class OrderItemInputDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ example: 38000 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number = 0;
}

export class CreateOrderDto {
  @ApiProperty({ enum: OrderSource, default: OrderSource.POS })
  @IsEnum(OrderSource)
  source: OrderSource;

  @ApiProperty({ type: [OrderItemInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];

  @ApiProperty({ example: 'Walk-in Customer', required: false })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({ example: 'customer@example.com', required: false })
  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 100000 })
  @IsNumber()
  @Min(0)
  amountPaid: number;

  @ApiProperty({ example: 'Less ice and sugar in drinks', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
