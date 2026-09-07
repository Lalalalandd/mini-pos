import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq, or, ilike } from 'drizzle-orm';
import { DRIZZLE_PROVIDER, DrizzleDB } from '../database/database.provider';
import { products, categories } from '../database/schema';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { RedisService } from '../redis/redis.service';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class ProductsService {
  private readonly CACHE_PREFIX = 'catalog:products:';

  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: DrizzleDB,
    private redisService: RedisService,
    private jobsService: JobsService,
  ) {}

  async findAll(query?: { search?: string; categoryId?: string; status?: string }) {
    const list = await this.db.query.products.findMany({
      with: { category: true },
      where: (p, { eq, and, or, ilike }) => {
        const filters = [];
        if (query?.search) {
          filters.push(or(ilike(p.name, `%${query.search}%`), ilike(p.sku, `%${query.search}%`), ilike(p.barcode, `%${query.search}%`)));
        }
        if (query?.categoryId) {
          filters.push(eq(p.categoryId, query.categoryId));
        }
        if (query?.status) {
          filters.push(eq(p.status, query.status as any));
        }
        return filters.length ? and(...filters) : undefined;
      },
      orderBy: (p, { asc }) => [asc(p.name)],
    });

    return list.map(this.formatProduct);
  }

  async findOne(id: string) {
    const product = await this.db.query.products.findFirst({
      where: eq(products.id, id),
      with: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.formatProduct(product);
  }

  async findByBarcodeOrSku(identifier: string) {
    const product = await this.db.query.products.findFirst({
      where: or(eq(products.barcode, identifier), eq(products.sku, identifier)),
      with: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with barcode/SKU "${identifier}" not found`);
    }

    return this.formatProduct(product);
  }

  async create(dto: CreateProductDto) {
    const existing = await this.db
      .select({ id: products.id })
      .from(products)
      .where(or(eq(products.sku, dto.sku), dto.barcode ? eq(products.barcode, dto.barcode) : undefined))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException(`Product with SKU "${dto.sku}" or Barcode already exists`);
    }

    const [created] = await this.db
      .insert(products)
      .values({
        name: dto.name,
        sku: dto.sku,
        barcode: dto.barcode || null,
        description: dto.description || null,
        price: dto.price.toString(),
        costPrice: (dto.costPrice || 0).toString(),
        stock: dto.stock || 0,
        minStockAlert: dto.minStockAlert || 5,
        categoryId: dto.categoryId,
        status: dto.status || 'ACTIVE',
        imageUrl: dto.imageUrl || null,
      })
      .returning();

    await this.redisService.invalidatePrefix('catalog:');
    return this.findOne(created.id);
  }

  async update(id: string, dto: Partial<UpdateProductDto>) {
    await this.findOne(id);

    const updatePayload: any = { ...dto, updatedAt: new Date() };
    if (dto.price !== undefined) updatePayload.price = dto.price.toString();
    if (dto.costPrice !== undefined) updatePayload.costPrice = dto.costPrice.toString();

    const [updated] = await this.db
      .update(products)
      .set(updatePayload)
      .where(eq(products.id, id))
      .returning();

    // Trigger stock alert if stock drops below threshold
    if (updated.stock <= updated.minStockAlert) {
      await this.jobsService.queueLowStockAlert(updated.id, updated.stock, updated.minStockAlert);
    }

    await this.redisService.invalidatePrefix('catalog:');
    return this.findOne(updated.id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.delete(products).where(eq(products.id, id));
    await this.redisService.invalidatePrefix('catalog:');
    return { success: true };
  }

  private formatProduct(item: any) {
    return {
      ...item,
      price: parseFloat(item.price),
      costPrice: parseFloat(item.costPrice || '0'),
    };
  }
}
