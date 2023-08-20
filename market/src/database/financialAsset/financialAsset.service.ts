import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { FinancialAsset, RawFinancialAsset } from "./financialAsset.entity";

@Injectable()
export class FinancialAssetService {

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
      SELECT * FROM financial_assets
        WHERE ${Object.entries(filter)
          .map(([k, v]) => `${this.entityPropNameToDbColumnName(k as keyof FinancialAsset)} = '${v}'`)
          .join(' AND ')}
        LIMIT 100
    `)).map(this.rawToEntity.bind(this));
  }

  public async readOneByPk(pk: FinancialAsset['symbol']) {
    return this.rawToEntity(
      (await this.dataSource.query<RawFinancialAsset[]>(`
        SELECT * FROM financial_assets
          WHERE symbol = '${pk}'
      `))[0]
    );
  }

  public async readSymbolsByExchange(exchange: FinancialAsset['exchange']) {
    return (await this.dataSource.query<{ symbol: string }[]>(`
      SELECT symbol FROM financial_assets
        WHERE exchange = '${exchange}'
    `)).map(({ symbol }) => symbol);
  }

  public async readManyByExchange(exchange: FinancialAsset['exchange']) {
    return (await this.dataSource.query<RawFinancialAsset[]>(`
      SELECT * FROM financial_assets
        WHERE exchange = '${exchange}'
    `)).map(this.rawToEntity.bind(this));
  }

  public async updatePrice() {}

  // Todo: Refac - 다른 엔티티와 공유하는 범용적인 메소드로
  private entityPropNameToDbColumnName = (propertyName: keyof FinancialAsset) => {
    return this.finAssetsRepo.metadata.columns.find(
      col => col.propertyName === propertyName
    )!.databaseName;
  }

  // Todo: Refac - 다른 엔티티와 공유하는 범용적인 메소드로
  private rawToEntity(raw: RawFinancialAsset): FinancialAsset {
    const finAsset = this.finAssetsRepo.create();
    this.finAssetsRepo.metadata.columns.forEach(col => {
      const v = raw[col.databaseName as keyof RawFinancialAsset];
      if (v === null) {
        return;
      } else {
        // @ts-ignore
        finAsset[col.propertyName as keyof FinancialAsset] = v;
      }
    });
    return finAsset;
  }

}
