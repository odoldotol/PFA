import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExchangeEntity } from "./exchange.entity";
import { Database_ExchangeService } from "./exchange.service";

@Module({
  imports: [TypeOrmModule.forFeature([ExchangeEntity])],
  providers: [Database_ExchangeService],
  exports: [Database_ExchangeService]
})
export class Database_ExchangeModule {}