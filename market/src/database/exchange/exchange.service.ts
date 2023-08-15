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

  public exists(filter: FindOptionsWhere<Exchange> | FindOptionsWhere<Exchange>[]) {
    return this.exchangesRepo.exist({ where: filter });
  }

  public readAll() {
    return this.exchangesRepo.find();
  }

  public async readOneByPK(pk: Exchange['ISO_Code']) {
    return (await this.dataSource.query<Exchange[]>(`
      SELECT * FROM exchanges
        WHERE iso_code = '${pk}'
    `))[0];
  }

}
