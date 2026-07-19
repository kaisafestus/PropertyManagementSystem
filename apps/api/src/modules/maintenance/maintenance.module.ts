import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { MaintenanceController } from './controllers/maintenance.controller';
import { MaintenanceRepository } from './repositories/maintenance.repository';
import { MaintenanceService } from './services/maintenance.service';

@Module({
  imports: [PrismaModule],
  controllers: [MaintenanceController],
  providers: [MaintenanceRepository, MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
