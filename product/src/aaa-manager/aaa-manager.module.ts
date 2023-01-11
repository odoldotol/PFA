import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../entity/account.entity';
import { AaaManagerController } from './aaa-manager.controller';
import { AaaManagerService } from './aaa-manager.service';

@Module({
  // imports: [TypeOrmModule.forFeature([Account])],
  controllers: [AaaManagerController],
  providers: [AaaManagerService]
})
export class AaaManagerModule {}
