import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TFulfilledYfPrice } from "src/market/financialAsset/type";
import { DataSource, QueryRunner, Repository } from "typeorm";
import { FinancialAsset, RawFinancialAsset } from "./financialAsset.entity";

@Injectable()
export class Database_FinancialAssetService {

  private readonly logger = new Logger('Database_'+Database_FinancialAssetService.name);
  private readonly tableName = this.finAssetsRepo.metadata.tableName;

  constructor(
    @InjectRepository(FinancialAsset)
    private readonly finAssetsRepo: Repository<FinancialAsset>,
    private readonly dataSource: DataSource
  ) {}

  public async createMany(values: readonly FinancialAsset[]): Promise<FinancialAsset[]> {
    if (values.length === 0) return Promise.resolve([]);
    return (await this.dataSource.query<RawFinancialAsset[]>(`
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
    `)).map(this.rawToEntity.bind(this));
  }

  public existByPk(pk: FinancialAsset['symbol']): Promise<boolean> {
    return this.finAssetsRepo.exist({ where: { symbol: pk } });
  }

  /**
   * Development Temporary Method
   * @description Returns LIMIT 100
   */
  public async readManyByEqualComparison(filter: Partial<FinancialAsset>): Promise<FinancialAsset[]> {
    return (await this.dataSource.query<RawFinancialAsset[]>(`
      SELECT * FROM ${this.tableName}
        WHERE ${Object.entries(filter)
          .map(([k, v]) => `${this.entityPropNameToDbColumnName(k as keyof FinancialAsset)} = '${v}'`)
          .join(' AND ')}
        LIMIT 100
    `)).map(this.rawToEntity.bind(this));
  }

  public async readOneByPk(pk: FinancialAsset['symbol']): Promise<FinancialAsset | null> {
    const raw = (await this.dataSource.query<RawFinancialAsset[]>(`
    SELECT * FROM ${this.tableName}
      WHERE symbol = '${pk}'
    `))[0];

    if (raw) return this.rawToEntity(raw);
    else return null;
  }

  public async readSymbolsByExchange(exchange: FinancialAsset['exchange']): Promise<FinancialAsset['symbol'][]> {
    return (await this.dataSource.query<{ symbol: string }[]>(`
      SELECT symbol FROM ${this.tableName}
        WHERE exchange ${exchange ? `= '${exchange}'` : `is NULL`}
    `)).map(({ symbol }) => symbol);
  }

  public async readManyByExchange(exchange: FinancialAsset['exchange']): Promise<FinancialAsset[]> {
    return (await this.dataSource.query<RawFinancialAsset[]>(`
      SELECT * FROM ${this.tableName}
        WHERE exchange ${exchange ? `= '${exchange}'` : `is NULL`}
    `)).map(this.rawToEntity.bind(this));
  }

  public async updatePriceMany(
    updateArr: readonly TFulfilledYfPrice[],
    queryRunner?: QueryRunner
  ): Promise<TFulfilledYfPrice[]> {
    if (updateArr.length === 0) return Promise.resolve([]);
    const updateColumn = this.entityPropNameToDbColumnName('regularMarketLastClose');
    return this.dataSource.query<[TFulfilledYfPrice[], number]>(
      `
        UPDATE ${this.tableName} AS t
          SET
            ${updateColumn} = u.${updateColumn}
          FROM (VALUES
            ${updateArr.map(u => `('${u.symbol}', ${u.regularMarketLastClose})`).join(',')}
          ) AS u(symbol, ${updateColumn})
          WHERE t.symbol = u.symbol
          RETURNING t.symbol, t.${updateColumn}
      `,
      undefined,
      queryRunner
    ).then(res => {
      res[1] === updateArr.length ||
      this.logger.warn(`updatePriceMany Warn! | Attempt: ${updateArr.length} | Success: ${res[1]}`); // Todo: 여기서 실패된 케이스도 전달하도록
      return res[0].map(this.rawToEntity.bind(this)) as TFulfilledYfPrice[]; //
    });
  }

  // Todo: Refac - 다른 엔티티 서비스와도 공유할 수 있도록?
  private entityPropNameToDbColumnName = (propertyName: keyof FinancialAsset) => {
    return this.finAssetsRepo.metadata.columns.find(
      col => col.propertyName === propertyName
    )!.databaseName;
  }

  // Todo: Refac - 다른 엔티티와 공유하는 범용적인 메소드로
  private rawToEntity<T extends Raw>(raw: T): T extends RawFinancialAsset ? FinancialAsset : Partial<FinancialAsset> {
    const finAsset = this.finAssetsRepo.create();
    this.finAssetsRepo.metadata.columns.forEach(col => {
      const v = raw[col.databaseName as keyof RawFinancialAsset];
      if (v === null || v === undefined) {
        return;
      } else {
        // @ts-ignore
        finAsset[col.propertyName as keyof FinancialAsset] = v;
      }
    });
    return finAsset;
  }

}

type Raw = RawFinancialAsset | Partial<RawFinancialAsset>;
