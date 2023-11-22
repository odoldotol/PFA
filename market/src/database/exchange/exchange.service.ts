import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, FindOptionsWhere, QueryRunner } from 'typeorm';
import { Exchange, RawExchange } from "./exchange.entity";

@Injectable()
export class ExchangeService {
  
  private readonly logger = new Logger('Database_'+ExchangeService.name);

  constructor(
    @InjectRepository(Exchange)
    private readonly exchangesRepo: Repository<Exchange>,
    private readonly dataSource: DataSource
  ) {}

  public async createOne(value: Exchange): Promise<Exchange> {
    return this.rawToEntity(
      (await this.dataSource.query<RawExchange[]>(`
        INSERT INTO exchanges
          VALUES
            ('${value.ISO_Code}', '${value.ISO_TimezoneName}', '${value.marketDate}')
          RETURNING *
      `))[0]
    );
  }

  public exist(condition: FindOptionsWhere<Exchange> | FindOptionsWhere<Exchange>[]): Promise<boolean> {
    return this.exchangesRepo.exist({ where: condition });
  }

  public readAll(): Promise<Exchange[]> {
    return this.exchangesRepo.find();
  }

  public async readOneByPk(pk: Exchange['ISO_Code']): Promise<Exchange> {
    return this.rawToEntity(
      (await this.dataSource.query<RawExchange[]>(`
        SELECT * FROM exchanges
          WHERE iso_code = '${pk}'
      `))[0]
    );
  }

  // Todo: warn case
  public async updateMarketDateByPk(
    pk: Exchange['ISO_Code'],
    update: Exchange['marketDate'],
    queryRunner?: QueryRunner
  ) {
    await this.dataSource.query(
      `
        UPDATE exchanges
          SET marketdate = '${update}'
          WHERE iso_code = '${pk}'
      `,
      undefined,
      queryRunner
    ).then(res => {
      res[1] === 1 || this.logger.warn(`updateMarketDateByPk Failed! | Args: ${[...arguments]}`);
    });
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
