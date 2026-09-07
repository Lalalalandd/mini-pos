import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { ProductModel } from './models/product.model';
import { CategoryModel } from './models/category.model';
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../categories/categories.service';
import { RedisService } from '../redis/redis.service';

@Resolver()
export class CatalogResolver {
  constructor(
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
    private readonly redisService: RedisService,
  ) {}

  @Query(() => [CategoryModel], { name: 'catalogCategories', description: 'Retrieve all catalog categories' })
  async getCategories() {
    const list = (await this.categoriesService.findAll()) as any[];
    return list.map((c: any) => ({
      ...c,
      createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
    }));
  }

  @Query(() => [ProductModel], { name: 'catalogProducts', description: 'Query active products with search and category filtering' })
  async getProducts(
    @Args('categoryId', { type: () => ID, nullable: true }) categoryId?: string,
    @Args('search', { type: () => String, nullable: true }) search?: string,
  ) {
    const cacheKey = `gql:catalog:products:${categoryId || 'all'}:${search || 'all'}`;
    const cached = await this.redisService.get<ProductModel[]>(cacheKey);
    if (cached) return cached;

    const list = await this.productsService.findAll({
      categoryId,
      search,
      status: 'ACTIVE',
    });

    const result = list.map((p) => ({
      ...p,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      category: p.category
        ? {
            ...p.category,
            createdAt: new Date(p.category.createdAt).toISOString(),
          }
        : undefined,
    }));

    await this.redisService.set(cacheKey, result, 300); // 5 min cache
    return result;
  }

  @Query(() => ProductModel, { name: 'productBySku', description: 'Retrieve single product by unique SKU' })
  async getProductBySku(@Args('sku') sku: string) {
    const product = await this.productsService.findByBarcodeOrSku(sku);
    return {
      ...product,
      createdAt: new Date(product.createdAt).toISOString(),
      category: product.category
        ? {
            ...product.category,
            createdAt: new Date(product.category.createdAt).toISOString(),
          }
        : undefined,
    };
  }
}
