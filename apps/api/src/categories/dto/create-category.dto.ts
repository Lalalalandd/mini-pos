import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Specialty Beverages', description: 'Category title' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'specialty-beverages', description: 'Unique kebab-case URL slug' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be kebab-case' })
  slug: string;

  @ApiProperty({ example: 'Artisan coffees, cold brews, and seasonal teas', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateCategoryDto extends CreateCategoryDto {}
