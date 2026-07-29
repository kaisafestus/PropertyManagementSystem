import { Global, Module } from '@nestjs/common';
import { AuditService } from './services/audit.service';
import { PasswordService } from './services/password.service';

@Global()
@Module({
  providers: [AuditService, PasswordService],
  exports: [AuditService, PasswordService],
})
export class CommonModule {}
