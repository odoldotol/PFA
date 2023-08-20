import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Exchange } from "./exchange.entity";
import { ExchangeService } from "./exchange.service";

@Module({
  imports: [TypeOrmModule.forFeature([Exchange])],
  providers: [ExchangeService],
  exports: [ExchangeService]
})
export class ExchangeModule {}