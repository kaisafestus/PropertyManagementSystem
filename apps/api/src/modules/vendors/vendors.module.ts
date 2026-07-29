import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { VendorsController } from './controllers/vendors.controller';
import { VendorsRepository } from './repositories/vendors.repository';
import { VendorsService } from './services/vendors.service';

@Module({
  imports: [PrismaModule],
  controllers: [VendorsController],
  providers: [VendorsRepository, VendorsService],
  exports: [VendorsService],
})
export class VendorsModule {}
