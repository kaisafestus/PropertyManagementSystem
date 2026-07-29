import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { FinancialController } from './controllers/financial.controller';
import { FinancialRepository } from './repositories/financial.repository';
import { FinancialService } from './services/financial.service';

@Module({
  imports: [PrismaModule],
  controllers: [FinancialController],
  providers: [FinancialRepository, FinancialService],
  exports: [FinancialService],
})
export class FinancialModule {}
