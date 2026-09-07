import { Module } from '@nestjs/common';
import { CatalogResolver } from './catalog.resolver';
import { ProductsModule } from '../products/products.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [ProductsModule, CategoriesModule],
  providers: [CatalogResolver],
})
export class CatalogModule {}
