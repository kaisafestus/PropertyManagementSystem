import { Module } from '@nestjs/common';

import { TenantPortalController } from './controllers/tenant-portal.controller';
import { TenantPortalService } from './services/tenant-portal.service';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [TenantPortalController],
  providers: [TenantPortalService],
  exports: [TenantPortalService],
})
export class TenantPortalModule {}
