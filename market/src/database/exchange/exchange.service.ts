import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository,
  FindOptionsWhere,
  QueryRunner
} from 'typeorm';
import { ExchangeEntity } from "./exchange.entity";
import { Exchange } from "src/common/class";
import {
  ExchangeCore,
  ExchangeIsoCode,
  MarketDate
} from "src/common/interface";

@Injectable()
export class Database_ExchangeService {
  
  private readonly logger = new Logger(Database_ExchangeService.name);
  private readonly tableName = this.exchangesRepo.metadata.tableName;

  constructor(
    @InjectRepository(ExchangeEntity)
    private readonly exchangesRepo: Repository<ExchangeEntity>,
    private readonly dataSource: DataSource
  ) {}

  public async createOne(value: ExchangeCore): Promise<Exchange> {
    return (await this.dataSource.query<ExchangeEntity[]>(`
      INSERT INTO ${this.tableName}
        VALUES
          ('${value.isoCode}', '${value.isoTimezoneName}', '${value.marketDate}')
        RETURNING *
    `).then(this.extendExchange))[0]!;
  }

  public exist(
    condition: FindOptionsWhere<ExchangeEntity> | FindOptionsWhere<ExchangeEntity>[]
  ): Promise<boolean> {
    return this.exchangesRepo.exist({ where: condition });
  }

  public readAll(): Promise<Exchange[]> {
    return this.exchangesRepo.find().then(this.extendExchange);
  }

  public async readOneByPk(pk: ExchangeIsoCode): Promise<Exchange> {
    return (await this.dataSource.query<ExchangeEntity[]>(`
      SELECT * FROM ${this.tableName}
        WHERE iso_code = '${pk}'
    `).then(this.extendExchange))[0]!;
  }

  // Todo: warn case - 에러를 던지게 하는게 옳은듯?
  public async updateMarketDateByPk(
    pk: ExchangeIsoCode,
    update: MarketDate,
    queryRunner?: QueryRunner
  ): Promise<void> {
    await this.dataSource.query(
      `
        UPDATE ${this.tableName}
          SET market_date = '${update}'
          WHERE iso_code = '${pk}'
      `,
      undefined,
      queryRunner
    ).then(res => {
      res[1] === 1 || this.logger.warn(`updateMarketDateByPk Failed! | Args: ${[...arguments]}`);
    });
  }

  private extendExchange(exchangeEntity: ExchangeEntity): Exchange;
  private extendExchange(exchangeEntityArr: ExchangeEntity[]): Exchange[];
  private extendExchange(arg: ExchangeEntity | ExchangeEntity[]): Exchange | Exchange[] {
    if (Array.isArray(arg)) {
      return arg.map(entity => new Exchange(entity));
    } else {
      return new Exchange(arg);
    }
  }

}
