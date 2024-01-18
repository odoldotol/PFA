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

  public exists(userId: number, ticker: string): Promise<boolean> {
    return this.dataSource.query<AssetSubscription[]>(`
      SELECT user_id, ticker
        FROM ${this.tableName}
        WHERE user_id = ${userId} AND ticker = '${ticker}'
        LIMIT 1
    `).then(res => res.length == 1);
  }

  public deleteOne(
    userId: number,
    ticker: string
  ): Promise<boolean> {
    return this.dataSource.query<[[], number]>(`
      DELETE FROM ${this.tableName}
        WHERE user_id = ${userId} AND ticker = '${ticker}'
    `).then(res => res[1] == 1);
  }

  /**
   * DESC LIMIT 100. Index Only Scan Backward.
   * @todo 레코드가 충분히 많지 않으면 Bitmap Scan 을 이용하는데, 이게 더 느린 스캔방식으로 유추됨(10배 많은 레코드를 Index Only Scan Backward 로 조회하는게 더 빠름을 확인함) => Bitmap Scan 을 막는 방법을 찾자. (아마 IDX_asset_subscriptions_user_id-ticker 인덱스 때문인것 같음)
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
