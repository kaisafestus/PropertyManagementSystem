import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { UnitsController } from './controllers/units.controller';
import { UnitsRepository } from './repositories/units.repository';
import { UnitsService } from './services/units.service';

@Module({
  imports: [PrismaModule],
  controllers: [UnitsController],
  providers: [UnitsRepository, UnitsService],
  exports: [UnitsService],
})
export class UnitsModule {}
