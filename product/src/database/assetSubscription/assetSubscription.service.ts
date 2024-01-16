import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { AssetSubscription } from "./assetSubscription.entity";

@Injectable()
export class AssetSubscriptionService {

  private readonly tableName = this.assetSubscriptionRepo.metadata.tableName;

  constructor(
    @InjectRepository(AssetSubscription)
    private readonly assetSubscriptionRepo: Repository<AssetSubscription>,
    private readonly dataSource: DataSource,
  ) {}

  public exists(userId: number, ticker: string): Promise<boolean> {
    return this.dataSource.query<AssetSubscription[]>(`
      SELECT user_id, ticker
        FROM ${this.tableName}
        WHERE user_id = ${userId} AND ticker = '${ticker}'
        LIMIT 1
    `).then(res => res.length == 1);
  }

  /**
   * 중복시 에러 발생
   */
  public createOne(
    userId: number,
    ticker: string
  ): Promise<AssetSubscription | null> {
    return this.dataSource.query<AssetSubscription[]>(`
      INSERT INTO ${this.tableName}
        (id, user_id, ticker)
        VALUES (DEFAULT, ${userId}, '${ticker}')
        RETURNING *
    `).then(res => res[0]!);
  }

  public deleteOne(
    userId: number,
    ticker: string
  ): Promise<boolean> {
    return this.dataSource.query<AssetSubscription[]>(`
      DELETE FROM ${this.tableName}
        WHERE user_id = ${userId} AND ticker = '${ticker}'
        RETURNING *
    `).then(res => res.length == 1);
  }

  /**
   * id DESC LIMIT 100
   * @todo Bitmap Scan vs Index Scan Backward vs Index Only Scan ??
   */
  public readTickersByUserId(userId: number): Promise<AssetSubscription['ticker'][]> {
    return this.dataSource.query<Pick<AssetSubscription, 'ticker'>[]>(`
      SELECT ticker
        FROM ${this.tableName}
        WHERE user_id = ${userId}
        ORDER BY id DESC
        LIMIT 100
    `).then(res => res.map(r => r.ticker));
  }

}
