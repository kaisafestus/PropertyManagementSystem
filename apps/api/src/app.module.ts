import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validate } from './config/env/env.configuration';
import { PrismaModule } from './database/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
