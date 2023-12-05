import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Exchange } from "./exchange.entity";
import { Database_ExchangeService } from "./exchange.service";

@Module({
  imports: [TypeOrmModule.forFeature([Exchange])],
  providers: [Database_ExchangeService],
  exports: [Database_ExchangeService]
})
export class Database_ExchangeModule {}