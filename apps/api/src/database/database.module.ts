import { Global, Module } from '@nestjs/common';
import { databaseProvider, DRIZZLE_PROVIDER } from './database.provider';

@Global()
@Module({
  providers: [databaseProvider],
  exports: [DRIZZLE_PROVIDER],
})
export class DatabaseModule {}
