import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { TenantsController } from './controllers/tenants.controller';
import { TenantsRepository } from './repositories/tenants.repository';
import { TenantsService } from './services/tenants.service';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [TenantsController],
  providers: [TenantsRepository, TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
