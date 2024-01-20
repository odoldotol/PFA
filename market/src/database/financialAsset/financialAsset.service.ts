import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  DataSource,
  QueryRunner,
  Repository
} from "typeorm";
import { FinancialAssetEntity } from "./financialAsset.entity";
import { FinancialAsset } from "src/common/class/financialAsset";
import {
  ExchangeIsoCode,
  FinancialAssetCore,
  FulfilledYfPrice,
  Ticker
} from "src/common/interface";

@Injectable()
export class Database_FinancialAssetService {

  private readonly logger = new Logger(Database_FinancialAssetService.name);
  private readonly tableName = this.finAssetsRepo.metadata.tableName;

  constructor(
    @InjectRepository(FinancialAssetEntity)
    private readonly finAssetsRepo: Repository<FinancialAssetEntity>,
    private readonly dataSource: DataSource
  ) {}

  public createMany(
    values: readonly FinancialAssetCore[]
  ): Promise<FinancialAsset[]> {
    if (values.length === 0) return Promise.resolve([]);
    return this.dataSource.query<FinancialAssetEntity[]>(`
    INSERT INTO ${this.tableName}
      VALUES
        ${values.map(v => `(
          '${v.symbol}',
          '${v.quoteType}',
          ${v.shortName ? `'${v.shortName}'` : `NULL`},
          ${v.longName ? `'${v.longName}'` : `NULL`},
          '${v.currency}',
          ${v.regularMarketLastClose},
          ${v.exchange ? `'${v.exchange}'` : `NULL`}
        )`).join(',')}
      RETURNING *
    `).then(this.extendFinancialAsset);
  }

  public existByPk(
    pk: Ticker
  ): Promise<boolean> {
    return this.finAssetsRepo.exist({ where: { symbol: pk } });
  }

  public async readOneByPk(pk: Ticker): Promise<FinancialAsset | null> {
    const res = (await this.dataSource.query<FinancialAssetEntity[]>(`
    SELECT * FROM ${this.tableName}
      WHERE symbol = '${pk}'
    `))[0];

    return res ? this.extendFinancialAsset(res) : null;
  }

  public async readSymbolsByExchange(
    exchange: ExchangeIsoCode | null
  ): Promise<Ticker[]> {
    return (await this.dataSource.query<Pick<FinancialAsset, 'symbol'>[]>(`
      SELECT symbol FROM ${this.tableName}
        WHERE exchange ${exchange ? `= '${exchange}'` : `is NULL`}
    `)).map(({ symbol }) => symbol);
  }

  public readManyByExchange(
    exchange: ExchangeIsoCode | null
  ): Promise<FinancialAsset[]> {
    return this.dataSource.query<FinancialAssetEntity[]>(`
      SELECT * FROM ${this.tableName}
        WHERE exchange ${exchange ? `= '${exchange}'` : `is NULL`}
    `).then(this.extendFinancialAsset);
  }

  /**
   * Todo: 부분의 성공, 실패를 반환해야한다.
   */
  public async updatePriceMany(
    updateArr: readonly FulfilledYfPrice[],
    queryRunner?: QueryRunner
  ): Promise<FulfilledYfPrice[]> {
    if (updateArr.length === 0) return Promise.resolve([]);
    return this.dataSource.query<[Pick<FinancialAssetEntity, 'symbol' | 'regular_market_last_close'>[], number]>(
      `
        UPDATE ${this.tableName} AS t
          SET
          regular_market_last_close = u.regular_market_last_close
          FROM (VALUES
            ${updateArr.map(u => `('${u.symbol}', ${u.regularMarketLastClose})`).join(',')}
          ) AS u(symbol, regular_market_last_close)
          WHERE t.symbol = u.symbol
          RETURNING t.symbol, t.regular_market_last_close
      `,
      undefined,
      queryRunner
    ).then(res => {
      res[1] === updateArr.length || this.logger.warn(
        `updatePriceMany Warn! | Attempt: ${updateArr.length} | Success: ${res[1]}`
      ); // Todo: 여기서 실패된 케이스도 전달하도록
      return res[0].map(pick => Object.assign(
        pick,
        { regularMarketLastClose: pick.regular_market_last_close }
      ));
    });
  }

  private extendFinancialAsset(financialAssetEntity: FinancialAssetEntity): FinancialAsset;
  private extendFinancialAsset(financialAssetEntityArr: FinancialAssetEntity[]): FinancialAsset[];
  private extendFinancialAsset(arg: FinancialAssetEntity | FinancialAssetEntity[]): FinancialAsset | FinancialAsset[] {
    if (Array.isArray(arg)) {
      return arg.map(entity => new FinancialAsset(entity));
    } else {
      return new FinancialAsset(arg);
    }
  }

}
