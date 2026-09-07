import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_PROVIDER, DrizzleDB } from '../database/database.provider';
import { categories } from '../database/schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CategoriesService {
  private readonly CACHE_KEY = 'catalog:categories:all';

  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: DrizzleDB,
    private redisService: RedisService,
  ) {}

  async findAll() {
    const cached = await this.redisService.get(this.CACHE_KEY);
    if (cached) return cached;

    const list = await this.db.select().from(categories).orderBy(categories.name);
    await this.redisService.set(this.CACHE_KEY, list, 3600); // 1 hour cache
    return list;
  }

  async findOne(id: string) {
    const [category] = await this.db.select().from(categories).where(eq(categories.id, id)).limit(1);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, dto.slug))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException(`Category with slug "${dto.slug}" already exists`);
    }

    const [created] = await this.db.insert(categories).values(dto).returning();
    await this.redisService.del(this.CACHE_KEY);
    return created;
  }

  async update(id: string, dto: Partial<UpdateCategoryDto>) {
    await this.findOne(id);
    const [updated] = await this.db
      .update(categories)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    await this.redisService.del(this.CACHE_KEY);
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.delete(categories).where(eq(categories.id, id));
    await this.redisService.del(this.CACHE_KEY);
    return { success: true };
  }
}
