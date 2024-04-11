import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmOptionsService } from './typeormOptions.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmOptionsService,
    })
  ],
  providers: [],
  exports: []
})
export class PostgresModule {}
