import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, FindOptionsWhere } from 'typeorm';
import { Exchange, RawExchange } from "./exchange.entity";

@Injectable()
export class ExchangeService {

  constructor(
    @InjectRepository(Exchange)
    private readonly exchangesRepo: Repository<Exchange>,
    private readonly dataSource: DataSource
  ) {}

  public createOne(value: Exchange) {
    return this.dataSource.query<Exchange>(`
      INSERT INTO exchanges
        VALUES
          ('${value.ISO_Code}', '${value.ISO_TimezoneName}', '${value.marketDate}')
        RETURNING *
    `);
  }

  public exist(condition: FindOptionsWhere<Exchange> | FindOptionsWhere<Exchange>[]) {
    return this.exchangesRepo.exist({ where: condition });
  }

  public readAll() {
    return this.exchangesRepo.find();
  }

  public async readOneByPk(pk: Exchange['ISO_Code']) {
    return this.rawToEntity(
      (await this.dataSource.query<RawExchange[]>(`
        SELECT * FROM exchanges
          WHERE iso_code = '${pk}'
      `))[0]
    );
  }

  public async updateMarketDateByPk(pk: Exchange['ISO_Code'], update: Exchange['marketDate']) {
    await this.dataSource.query(`
      UPDATE exchanges
        SET marketdate = '${update}'
        WHERE iso_code = '${pk}'
    `);
  }

  // Todo: Refac - 다른 엔티티와 공유하는 범용적인 메소드로
  private rawToEntity(raw: RawExchange): Exchange {
    const exchange = this.exchangesRepo.create();
    this.exchangesRepo.metadata.columns.forEach(col => {
      const v = raw[col.databaseName as keyof RawExchange];
      if (v === null) {
        return;
      } else {
        exchange[col.propertyName as keyof Exchange] = v;
      }
    });
    return exchange;
  }

}
