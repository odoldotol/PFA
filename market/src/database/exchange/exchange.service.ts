import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, FindOptionsWhere } from 'typeorm';
import { Exchange } from "./exchange.entity";

@Injectable()
export class ExchangeService {

  constructor(
    @InjectRepository(Exchange)
    private readonly exchangesRepo: Repository<Exchange>,
    private readonly dataSource: DataSource
  ) {}

  public createOne(value: Exchange) {
    return this.dataSource.query(`
      INSERT INTO exchanges
        VALUES
          ('${value.ISO_Code}', '${value.ISO_TimezoneName}', '${value.marketDate}', ${value.yf_exchangeName ? "'"+value.yf_exchangeName+"'" : null})
    `);
  }

  public async exists(filter: FindOptionsWhere<Exchange> | FindOptionsWhere<Exchange>[]) {
    return await this.exchangesRepo.findOneBy(filter) ? true : false;
  }
}
