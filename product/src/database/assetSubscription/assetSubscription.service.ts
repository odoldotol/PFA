import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AssetSubscription, RawAssetSubscription } from "./assetSubscription.entity";

@Injectable()
export class AssetSubscriptionService {

  constructor(
    @InjectRepository(AssetSubscription)
    private readonly assetSubscriptionRepo: Repository<AssetSubscription>,
  ) {}

  public exists(userId: string, ticker: string): Promise<boolean> {
    return this.assetSubscriptionRepo.exists({
      where: {
        user: userId,
        ticker,
      }
    });
  }

  public create(
    userId: string,
    ticker: string
  ): Promise<RawAssetSubscription> {
    return this.assetSubscriptionRepo.insert({
      user: userId,
      ticker,
    }).then(res => res.raw[0] as RawAssetSubscription);
  }

  // Todo: Refac
  public delete(
    userId: string,
    ticker: string
  ) {
    return this.assetSubscriptionRepo.delete({
      user: userId,
      ticker,
    });
  }

  public readByUserId(userId: string): Promise<AssetSubscription[]> {
    return this.assetSubscriptionRepo.find({
      where: {
        user: userId,
      },
    });
  }

}
