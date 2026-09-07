import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DRIZZLE_PROVIDER, DrizzleDB } from '../../database/database.provider';
import { Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { users } from '../../database/schema';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    @Inject(DRIZZLE_PROVIDER) private db: DrizzleDB,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET', 'super_secret_jwt_access_key_min_32_chars_long'),
    });
  }

  async validate(payload: JwtPayload) {
    const userList = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    const user = userList[0];
    if (!user) {
      throw new UnauthorizedException('User session is invalid or has expired');
    }

    return user;
  }
}
