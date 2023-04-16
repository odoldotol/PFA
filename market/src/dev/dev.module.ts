import { Module } from '@nestjs/common';
import { DevController } from './dev.controller';
import { DevService } from './dev.service';
import { DBModule } from '@database.module';
import { ChildApiModule } from '@child-api.module';

@Module({
  imports: [
    DBModule,
    ChildApiModule,],
  controllers: [
    DevController,],
  providers: [
    DevService,],
})
export class DevModule {}
