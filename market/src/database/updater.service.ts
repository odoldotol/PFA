import { Injectable, Logger } from "@nestjs/common";
import { Either } from "src/common/class/either";
import { Exchange } from "src/market/exchange/class/exchange";
import { FinancialAssetService } from "./financialAsset/financialAsset.service";
import { ExchangeService } from "./exchange/exchange.service";
import { TFulfilledYfPrice } from "src/market/asset/type";
import { TUpdateTuple } from "src/common/type";
import { Log_priceUpdateService } from "./log_priceUpdate/log_priceUpdate.service";
import * as F from '@fxts/core';
import { Log_priceUpdate } from "./log_priceUpdate/log_priceUpdate.schema";
import { Launcher } from "src/common/enum";

@Injectable()
export class UpdaterService {

  private readonly logger = new Logger("Database_"+UpdaterService.name);

  constructor(
    private readonly finAssetSrv: FinancialAssetService,
    private readonly exchangeSrv: ExchangeService,
    private readonly log_priceUpdateSrv: Log_priceUpdateService
  ) {}

  public async updatePriceStandard(
    updateArr: Either<any, TFulfilledYfPrice>[], // temp - any
    exchange: Exchange,
    startTime: Date,
    launcher: Launcher
  ) {
    // 업데이트 해야하는 것만 골라서 업데이트
    const fulfilledPriceArr = Either.getRightArray(updateArr);
    const updateRes = await this.finAssetSrv.updatePriceMany(fulfilledPriceArr);
    // 성공한것으로 값 mapping, 매핑되지 않은것은 실패한것임. left 로 바꾸기
    const updateResMap = new Map(updateRes.map(e => [e.symbol, e]));

    // [symbol, price] TUpdateTuple 형태로 변환하기
    // 변환된걸로 로그 create 하고 리턴값도 변환된걸로 쓰기
    const result: Either<any, TUpdateTuple>[] = await Promise.all(updateArr.map(e => {
      if (e.isRight() && updateResMap.get(e.getRight.symbol) === undefined) return Either.left<any, TFulfilledYfPrice>({
        message: 'updatePriceMany failure',
        data: e.getRight
      });
      else return e;
    }).map(e => e.map<TUpdateTuple>(ele => [ele.symbol, ele.regularMarketLastClose])));

    await this.exchangeSrv.updateMarketDateByPk(exchange.ISO_Code, exchange.getMarketDateYmdStr());

    const endTime = new Date();
    
    await this.createLogPriceUpdate(launcher, true, exchange.ISO_Code, {
      updatePriceResult: result,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    });
    return result;
  }

  private createLogPriceUpdate(
    launcher: Launcher,
    isStandard: boolean,
    key: string | Array<string | Object>,
    updateResult: {
      updatePriceResult: Either<any, TUpdateTuple>[],
      startTime: string,
      endTime: string
    }
  ) {
    const newLogDoc: Log_priceUpdate = {
      launcher,
      isStandard,
      key,
      success: [],
      failure: [],
      startTime: updateResult.startTime,
      endTime: updateResult.endTime,
      duration: new Date(updateResult.endTime).getTime() - new Date(updateResult.startTime).getTime()
    };
    F.pipe(
      updateResult.updatePriceResult,
      F.each(ele => ele.isRight() ? newLogDoc.success.push(ele.getRight) : newLogDoc.failure.push(ele.getLeft))
    );
    const fLen = newLogDoc.failure.length;
    return this.log_priceUpdateSrv.create(newLogDoc).then(_ => {
      this.logger.verbose(
        `${launcher === Launcher.SCHEDULER || launcher === Launcher.INITIATOR ? key : launcher} : Log_priceUpdate Doc Created${fLen ? ` (${fLen} failed)` : ''}`
      );
    }).catch((error) => {
      this.logger.error(`${launcher} : Failed to Create Log_priceUpdate Doc!!!`);
      throw error;
    });
  }

}