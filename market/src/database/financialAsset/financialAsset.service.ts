import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FinancialAsset } from "./financialAsset.entity";

@Injectable()
export class FinancialAssetService {

  constructor(
    @InjectRepository(FinancialAsset)
    private readonly financialAssetRepository: Repository<FinancialAsset>
  ) {}

}
