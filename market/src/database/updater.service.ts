import { Injectable, Logger } from "@nestjs/common";
import { Either, eitherMap } from "src/common/class/either";
import { Exchange } from "src/market/exchange/class/exchange";
import { FinancialAssetService } from "./financialAsset/financialAsset.service";
import { ExchangeService } from "./exchange/exchange.service";
import { TFulfilledYfPrice } from "src/market/asset/type";
import { TUpdateTuple } from "src/common/type";
import { Log_priceUpdateService } from "./log_priceUpdate/log_priceUpdate.service";
import { Log_priceUpdate } from "./log_priceUpdate/log_priceUpdate.schema";
import { Launcher } from "src/common/enum";
import * as F from '@fxts/core';

@Injectable()
export class UpdaterService {

  private readonly logger = new Logger("Database_"+UpdaterService.name);

  constructor(
    private readonly finAssetSrv: FinancialAssetService,
    private readonly exchangeSrv: ExchangeService,
    private readonly log_priceUpdateSrv: Log_priceUpdateService
  ) {}

  public async updatePriceStandard(
    updateEitherArr: readonly Either<any, TFulfilledYfPrice>[],
    exchange: Exchange,
    startTime: Date,
    launcher: Launcher
  ) {
    const fulfilledPriceArr = Either.getRightArray(updateEitherArr);
    const updateRes = await this.finAssetSrv.updatePriceMany(fulfilledPriceArr);
    const symbolUpdateResEleMap = new Map(updateRes.map(e => [e.symbol, e]));

    // Todo:
    const turnLeftIfUpdateFailed = (either: Either<any, TFulfilledYfPrice>) => {
      if (either.isRight() && symbolUpdateResEleMap.get(either.getRight.symbol) === undefined)
      return Either.left<any, TFulfilledYfPrice>({
        message: 'updatePriceMany failure',
        data: either.getRight
      });
      else return either;
    };

    const convertFulfilledYfPriceToUpdateTuple =
    (rightV: TFulfilledYfPrice): TUpdateTuple => [ rightV.symbol, rightV.regularMarketLastClose ];

    const result: Either<any, TUpdateTuple>[] = await Promise.all(
      updateEitherArr
      .map(turnLeftIfUpdateFailed)
      .map(eitherMap(convertFulfilledYfPriceToUpdateTuple))
    );

    await this.exchangeSrv.updateMarketDateByPk(
      exchange.ISO_Code,
      exchange.getMarketDateYmdStr()
    );

    // warn: 아래는 불필요한 부분일 수 있음 ----------------
    const endTime = new Date();
    await this.createLog_priceUpdate(
      launcher,
      true,
      exchange.ISO_Code,
      {
        updatePriceResult: result,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      }
    );
    // ----------------------------------------------
    
    return result;
  }

  // 불필요한 부분일 수 있음
  private createLog_priceUpdate(
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

    return this.log_priceUpdateSrv.create(newLogDoc)
    .then(_ => {
      this.logger.verbose(
        `${launcher === Launcher.SCHEDULER || launcher === Launcher.INITIATOR ? key : launcher} : Log_priceUpdate Doc Created${fLen ? ` (${fLen} failed)` : ''}`
      );
    })
    .catch(error => {
      this.logger.warn(`${launcher} : Failed to Create Log_priceUpdate Doc!!!`);
      // throw error;
    });
  }

}