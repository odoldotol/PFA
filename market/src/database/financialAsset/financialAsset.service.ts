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

}
