import { Injectable } from '@nestjs/common';
import { DBRepository } from 'src/database/database.repository';
import { ExchangeService } from 'src/market/exchange.service';
import * as F from "@fxts/core";

@Injectable()
export class DevService {

  constructor(
    private readonly dbRepo: DBRepository,
    private readonly exchangeSrv: ExchangeService
  ) {}

  public getAllAssetsInfo() {
    return this.dbRepo.readAllAssetsInfo();
  }

  public getAllExchange() {
    return this.dbRepo.readAllExchange();
  }

  public getAllExchangeFromMarket() {
    return this.exchangeSrv.findAll().map(
      exchange => F.omit(["_events", "logger", "childApiSrv"] as any, exchange)
    );
  }

  public getUpdateLog(ISO_Code?: string, limit?: number) {
    return this.dbRepo.readUpdateLog(ISO_Code, limit);
  }
}
