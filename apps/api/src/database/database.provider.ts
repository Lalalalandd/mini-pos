import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
const postgres = require('postgres');
import * as schema from './schema';

export const DRIZZLE_PROVIDER = 'DRIZZLE_DATABASE';

export type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;

export const databaseProvider: Provider = {
  provide: DRIZZLE_PROVIDER,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const connectionString =
      configService.get<string>('DATABASE_URL') ||
      'postgresql://pos_admin:pos_secret_password@localhost:5432/mini_pos_db';

    const client = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    return drizzle(client, { schema });
  },
};
