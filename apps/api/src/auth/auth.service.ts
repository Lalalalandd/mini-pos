import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { DRIZZLE_PROVIDER, DrizzleDB } from '../database/database.provider';
import { users } from '../database/schema';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import { AuthResponse, Role, UserDto } from '@mini-pos/shared';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private db: DrizzleDB,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    // Security Enforcement: Self-registration is strictly CUSTOMER. Administrative accounts can only be provisioned by authenticated Admins.
    const assignedRole = 'CUSTOMER';

    const [createdUser] = await this.db
      .insert(users)
      .values({
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: assignedRole,
      })
      .returning();

    const tokens = await this.generateTokens(createdUser.id, createdUser.email, createdUser.role);
    await this.updateRefreshTokenHash(createdUser.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.mapToUserDto(createdUser),
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email.toLowerCase()))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.mapToUserDto(user),
    };
  }

  async refreshToken(dto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get<string>(
          'JWT_REFRESH_SECRET',
          'super_secret_jwt_refresh_key_min_32_chars_long',
        ),
      });

      const [user] = await this.db
        .select()
        .from(users)
        .where(eq(users.id, payload.sub))
        .limit(1);

      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Access denied. Invalid session.');
      }

      const isTokenMatch = await bcrypt.compare(dto.refreshToken, user.refreshTokenHash);
      if (!isTokenMatch) {
        throw new UnauthorizedException('Refresh token is invalid or has been revoked');
      }

      // Rotate tokens
      const newTokens = await this.generateTokens(user.id, user.email, user.role);
      await this.updateRefreshTokenHash(user.id, newTokens.refreshToken);

      return newTokens;
    } catch (error) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
  }

  async logout(userId: string): Promise<{ success: boolean }> {
    await this.db
      .update(users)
      .set({ refreshTokenHash: null, updatedAt: new Date() })
      .where(eq(users.id, userId));
    return { success: true };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const accessSecret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'super_secret_jwt_access_key_min_32_chars_long',
    );
    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'super_secret_jwt_refresh_key_min_32_chars_long',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { secret: accessSecret, expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { secret: refreshSecret, expiresIn: '7d' },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.db
      .update(users)
      .set({ refreshTokenHash: hash, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  private mapToUserDto(user: any): UserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }
}
