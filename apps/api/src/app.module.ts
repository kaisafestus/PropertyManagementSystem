import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validate } from './config/env/env.configuration';
import { PrismaModule } from './database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { UnitsModule } from './modules/units/units.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    PrismaModule,
    AuthModule,
    PropertiesModule,
    UnitsModule,
    TenantsModule,
    VendorsModule,
    MaintenanceModule,
    HealthModule,
  ],
})
export class AppModule {}
