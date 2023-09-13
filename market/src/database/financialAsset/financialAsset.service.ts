import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TFulfilledYfPrice } from "src/market/asset/type";
import { DataSource, Repository } from "typeorm";
import { FinancialAsset, RawFinancialAsset } from "./financialAsset.entity";

@Injectable()
export class FinancialAssetService {

  private readonly logger = new Logger('Database_'+FinancialAssetService.name);
  private readonly tableName = this.finAssetsRepo.metadata.tableName;

  constructor(
    @InjectRepository(FinancialAsset)
    private readonly finAssetsRepo: Repository<FinancialAsset>,
    private readonly dataSource: DataSource
  ) {}

  public createMany(values: FinancialAsset[]) {
    return this.finAssetsRepo.insert(values);
  }

  public existByPk(pk: FinancialAsset['symbol']) {
    return this.finAssetsRepo.exist({ where: { symbol: pk } });
  }

  /**
   * Development Temporary Method
   * @description Returns LIMIT 100
   */
  public async readManyByEqualComparison(filter: Partial<FinancialAsset>) {
    return (await this.dataSource.query<RawFinancialAsset[]>(`
      SELECT * FROM ${this.tableName}
        WHERE ${Object.entries(filter)
          .map(([k, v]) => `${this.entityPropNameToDbColumnName(k as keyof FinancialAsset)} = '${v}'`)
          .join(' AND ')}
        LIMIT 100
    `)).map(this.rawToEntity.bind(this));
  }

  public async readOneByPk(pk: FinancialAsset['symbol']) {
    return this.rawToEntity(
      (await this.dataSource.query<RawFinancialAsset[]>(`
        SELECT * FROM ${this.tableName}
          WHERE symbol = '${pk}'
      `))[0]
    );
  }

  public async readSymbolsByExchange(exchange: FinancialAsset['exchange']) {
    return (await this.dataSource.query<{ symbol: string }[]>(`
      SELECT symbol FROM ${this.tableName}
        WHERE exchange ${exchange ? `= '${exchange}'` : `is NULL`}
    `)).map(({ symbol }) => symbol);
  }

  public async readManyByExchange(exchange: FinancialAsset['exchange']) {
    return (await this.dataSource.query<RawFinancialAsset[]>(`
      SELECT * FROM ${this.tableName}
        WHERE exchange ${exchange ? `= '${exchange}'` : `is NULL`}
    `)).map(this.rawToEntity.bind(this)) as FinancialAsset[];
  }

  public async updatePriceMany(updateArr: TFulfilledYfPrice[]) {
    const updateColumn = this.entityPropNameToDbColumnName('regularMarketLastClose');
    return this.dataSource.query(`
      UPDATE ${this.tableName} AS t
        SET
          ${updateColumn} = u.${updateColumn}
        FROM (VALUES
          ${updateArr.map(u => `('${u.symbol}', ${u.regularMarketLastClose})`).join(',')}
        ) AS u(symbol, ${updateColumn})
        WHERE t.symbol = u.symbol
        RETURNING t.symbol, t.${updateColumn}
    `).then((res: [Partial<RawFinancialAsset>[], number]) => {
      res[1] === updateArr.length ||
      this.logger.warn(`updatePriceMany Warn! | Attempt: ${updateArr.length} | Success: ${res[1]}`); // Todo: 여기서 실패된 케이스도 전달하도록
      return res[0].map(this.rawToEntity.bind(this)) as TFulfilledYfPrice[];
    });
  }

  // Todo: Refac - 다른 엔티티와 공유하는 범용적인 메소드로
  private entityPropNameToDbColumnName = (propertyName: keyof FinancialAsset) => {
    return this.finAssetsRepo.metadata.columns.find(
      col => col.propertyName === propertyName
    )!.databaseName;
  }

  // Todo: Refac - 다른 엔티티와 공유하는 범용적인 메소드로
  private rawToEntity(raw: Partial<RawFinancialAsset>): Partial<FinancialAsset> {
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
