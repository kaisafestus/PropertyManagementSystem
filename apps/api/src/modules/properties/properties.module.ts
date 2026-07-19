import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma/prisma.module';

import { PropertiesController } from './controllers/properties.controller';
import { PropertiesRepository } from './repositories/properties.repository';
import { PropertiesService } from './services/properties.service';

@Module({
  imports: [PrismaModule],
  controllers: [PropertiesController],
  providers: [PropertiesRepository, PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
