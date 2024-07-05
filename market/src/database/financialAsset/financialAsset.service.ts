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
// import { writeFile } from "fs";

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

    const query = "" +
`
INSERT INTO ${this.tableName}
  (
    symbol,
    quote_type,
    short_name,
    long_name,
    currency,
    regular_market_last_close,
    regular_market_previous_close,
    exchange
  )
  VALUES
  ${values.map(v => `(
    '${v.symbol}',
    '${v.quoteType}',
    ${v.shortName ? `'${this.handleEscape(v.shortName)}'` : `NULL`},
    ${v.longName ? `'${this.handleEscape(v.longName)}'` : `NULL`},
    '${v.currency}',
    ${v.regularMarketLastClose},
    ${v.regularMarketPreviousClose ? v.regularMarketPreviousClose : `DEFAULT`},
    ${v.exchange ? `'${v.exchange}'` : `NULL`}
  )`).join(',')}
  RETURNING *
`;

    // writeFile(`seeder/sql/insert.timestamp-${new Date().toLocaleString('en-GB').replace(/\/|,|:| /g, '-')}.sql`, query, () => console.log("createMany sql file created"));
    
    return this.dataSource.query<FinancialAssetEntity[]>(query)
    .then(this.extendFinancialAsset);
  }

  public existByPk(
    pk: Ticker
  ): Promise<boolean> {
    return this.finAssetsRepo.exist({ where: { symbol: pk } });
  }

  public async readOneByPk(pk: Ticker): Promise<FinancialAsset | null> {
    const res = (await this.dataSource.query<FinancialAssetEntity[]>(
`
SELECT *
  FROM ${this.tableName}
  WHERE symbol = '${pk}'
`
    ))[0];

    return res ? this.extendFinancialAsset(res) : null;
  }

  public async readSymbolsByExchange(
    exchange: ExchangeIsoCode | null
  ): Promise<Ticker[]> {
    return (await this.dataSource.query<Pick<FinancialAsset, 'symbol'>[]>(
`
SELECT symbol
  FROM ${this.tableName}
  WHERE exchange ${exchange ? `= '${exchange}'` : `is NULL`}
`
    )).map(({ symbol }) => symbol);
  }

  public readManyByExchange(
    exchange: ExchangeIsoCode | null
  ): Promise<FinancialAsset[]> {
    return this.dataSource.query<FinancialAssetEntity[]>(
`
SELECT *
  FROM ${this.tableName}
  WHERE exchange ${exchange ? `= '${exchange}'` : `is NULL`}
`
    ).then(this.extendFinancialAsset);
  }

  /**
   * Todo: 부분의 성공, 실패를 반환해야한다.
   */
  public async updatePriceMany(
    updateArr: readonly FulfilledYfPrice[],
    queryRunner?: QueryRunner
  ): Promise<FulfilledYfPrice[]> {
    if (updateArr.length === 0) return Promise.resolve([]);
    return this.dataSource.query<[
      Pick<FinancialAssetEntity, 'symbol' | 'regular_market_last_close' | 'regular_market_previous_close'>[],
      number
    ]>(
// "EXPLAIN ANALYZE" + // EXPLAIN ANALYZE 테스트
`
UPDATE ${this.tableName} AS t
  SET
    regular_market_last_close = u.regular_market_last_close,
    regular_market_previous_close = COALESCE(u.regular_market_previous_close, NULL::double precision)
  FROM (VALUES
    ${updateArr.map(u => `('${u.symbol}', ${u.regularMarketLastClose}, ${u.regularMarketPreviousClose})`).join(`,
    `)}
  ) AS u(symbol, regular_market_last_close, regular_market_previous_close)
  WHERE t.symbol = u.symbol
  RETURNING t.symbol, t.regular_market_last_close, t.regular_market_previous_close
`,
      undefined,
      queryRunner
    )
    .then(this.logExplainAndThrowErr.bind(this))
    .then(res => {
      res[1] === updateArr.length || this.logger.warn(
        `updatePriceMany Warn! | Attempt: ${updateArr.length} | Success: ${res[1]}`
      ); // Todo: 여기서 실패된 케이스도 전달하도록
      return res[0].map(pick => Object.assign( // assign 말고 확장하는 솔루션 쓰기
        pick,
        {
          regularMarketLastClose: pick.regular_market_last_close,
          regularMarketPreviousClose: pick.regular_market_previous_close
        }
      ));
    });
  }

  private logExplainAndThrowErr<T>(res: T): T {
    if (Array.isArray(res) && res[0]["QUERY PLAN"]) {
      this.logger.verbose(res.reduce((acc, r) => acc + "\n" + r["QUERY PLAN"], "QUERY PLAN"));
      throw new Error("EXPLAIN ANALYZE");
    }
    return res;
  };

  /**
   * @todo common util
   */
  private handleEscape(str: string): string {
    return str.replace(/'/g, "''");
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
