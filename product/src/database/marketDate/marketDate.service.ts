import { Injectable } from "@nestjs/common";
import { InjectRedisRepository } from "../decorator";
import { MarketDate } from "./marketDate.schema";
import { Repository } from "../redis/redis.repository";

@Injectable()
// Todo: Refac
export class MarketDateService {

  constructor(
    @InjectRedisRepository(MarketDate)
    private readonly marketDateRepo: Repository<MarketDate>,
  ) {}

  // 배열 받지마
  public create([ISO_Code, marketDate]: [ISO_Code, MarketDate]) {
    return this.marketDateRepo.createOne(ISO_Code, marketDate);
  }

  public read(ISO_Code: ISO_Code) {
    return this.marketDateRepo.findOne(ISO_Code);
  }

  // 배열 받지마
  public update([ISO_Code, marketDate]: [ISO_Code, MarketDate]) {
    return this.marketDateRepo.updateOne(ISO_Code, marketDate);
  }

  getAllAsMap() {
    return this.marketDateRepo.getAllKeyValueMap();
  }

}
