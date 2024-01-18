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

  public updateOneActivate(
    userId: number,
    ticker: string,
    activate: boolean
  ): Promise<AssetSubscription | null> {
    return this.dataSource.query<[AssetSubscription[], number]>(`
      UPDATE ${this.tableName}
        SET activate = ${activate}
        WHERE user_id = ${userId} AND ticker = '${ticker}'
        RETURNING *
    `).then(res => res[1] == 0 ? null : res[0][0]!);
  }

  public readOneAcivate(
    userId: number,
    ticker: string
  ): Promise<AssetSubscription | null> {
    return this.dataSource.query<AssetSubscription[]>(`
      SELECT activate
        FROM ${this.tableName}
        WHERE user_id = ${userId} AND ticker = '${ticker}'
        LIMIT 1
    `).then(res => res[0] || null);
  }

  /**
   * DESC LIMIT 100. Index Only Scan Backward.
   * @todo 레코드가 충분히 많지 않으면 Bitmap Scan 을 이용하는데, 이게 더 느린 스캔방식 으로 확인되는데(Index Only Scan Backward 로 조회하는게 더 빠름) => Bitmap Scan 을 막는 방법을 찾고 더 정확한 테스트 해보자.
   * @todo Bitmap Scan 을 이용할때 user_id-ticker 인덱스를 쓰는것이 user_id-id-ticker 인덱스를 쓰는것 보다 빠르다. user_id-id-ticker 인덱스를 먼저 선언하면 이걸 이용해서 더 느려진다.
   */
  public readActivatedTickersByUserId(userId: number): Promise<AssetSubscription['ticker'][]> {
    return this.dataSource.query<Pick<AssetSubscription, 'ticker'>[]>(`
      SELECT ticker
        FROM ${this.tableName}
        WHERE user_id = ${userId} AND activate = true
        ORDER BY updated_at DESC
        LIMIT 100
    `).then(res => res.map(r => r.ticker));
  }

}
