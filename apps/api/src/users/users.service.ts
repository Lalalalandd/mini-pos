import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { DRIZZLE_PROVIDER, DrizzleDB } from '../database/database.provider';
import { users } from '../database/schema';
import { Role } from '@mini-pos/shared';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE_PROVIDER) private db: DrizzleDB) {}

  async findAll() {
    const list = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);

    return list;
  }

  async findById(id: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async create(dto: { name: string; email: string; password?: string; role: Role }) {
    const existing = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException(`User with email "${dto.email}" already exists`);
    }

    const passwordHash = await bcrypt.hash(dto.password || 'password123', 10);

    const [created] = await this.db
      .insert(users)
      .values({
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role || 'CASHIER',
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return created;
  }

  async update(id: string, dto: { name?: string; email?: string; role?: Role; password?: string }) {
    await this.findById(id);

    const updatePayload: any = { updatedAt: new Date() };
    if (dto.name) updatePayload.name = dto.name;
    if (dto.email) updatePayload.email = dto.email.toLowerCase();
    if (dto.role) updatePayload.role = dto.role;
    if (dto.password) {
      updatePayload.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const [updated] = await this.db
      .update(users)
      .set(updatePayload)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return updated;
  }

  async updateRole(id: string, role: Role) {
    return this.update(id, { role });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.db.delete(users).where(eq(users.id, id));
    return { success: true };
  }
}
