import { Injectable } from "@nestjs/common";
import { InjectRepository } from "./decorator/injectRepository.decorator";
import { MarketDate } from "src/common/class/marketDate.class";
import { InMemoryRepository } from "./interface";

@Injectable()
export class MarketDateService {

  constructor(
    @InjectRepository(MarketDate.name)
    private readonly marketDateRepo: InMemoryRepository<MarketDate>,
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
