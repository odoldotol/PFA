import { Injectable, Logger } from "@nestjs/common";
import { Either, eitherMap } from "src/common/class/either";
import { Market_Exchange } from "src/market/exchange/class/exchange";
import { Database_FinancialAssetService } from "./financialAsset/financialAsset.service";
import { Database_ExchangeService } from "./exchange/exchange.service";
import { TFulfilledYfPrice } from "src/market/financialAsset/type";
import { TUpdateTuple } from "src/common/type";
import { LogPriceUpdateService } from "./log_priceUpdate/log_priceUpdate.service";
import { Log_priceUpdate } from "./log_priceUpdate/log_priceUpdate.schema";
import { DataSource } from "typeorm";
import { Launcher } from "src/common/enum";
import * as F from '@fxts/core';

@Injectable()
export class DatabaseService {

  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    private readonly financialAssetSrv: Database_FinancialAssetService,
    private readonly exchangeSrv: Database_ExchangeService,
    private readonly dataSource: DataSource,
    private readonly logPriceUpdateSrv: LogPriceUpdateService
  ) {}

  public async updatePriceStandard(
    updateEitherArr: readonly Either<any, TFulfilledYfPrice>[],
    exchange: Market_Exchange,
    startTime: Date,
    launcher: Launcher
  ): Promise<Either<any, TUpdateTuple>[]> {
    let updateRes: Promise<TFulfilledYfPrice[]>;
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction("REPEATABLE READ");
      await (updateRes = this.financialAssetSrv.updatePriceMany(
        Either.getRightArray(updateEitherArr),
        queryRunner
      ));
      await this.exchangeSrv.updateMarketDateByPk(
        exchange.ISO_Code,
        exchange.marketDate,
        queryRunner
      );
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      // Todo: warn
      this.logger.warn(`Transaction Rollback!!!\nError: ${err}`); throw err;
    } finally {
      await queryRunner.release();
    }

    // Todo: Refac -----------------------------------------
    // financialAssetSrv.updatePriceMany 에서 부터 성공 실패를 Either 로 반환하도록 해야한다.
    const symbolToUpdateResEleMap = new Map((await updateRes).map(e => [e.symbol, e]));
    const turnLeftIfUpdateFailed = (either: Either<any, TFulfilledYfPrice>) => {
      if (either.isRight() && symbolToUpdateResEleMap.get(either.right.symbol) === undefined)
      return Either.left<any, TFulfilledYfPrice>({
        message: 'updatePriceMany failure',
        data: either.right
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
    // -----------------------------------------------------

    // Todo: Refac (불필요한 부분일 수 있음) ---------------------
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
    // ------------------------------------------------------
    
    return result;
  }

  // 불필요한 부분일 수 있음 --------------------------------------
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
      F.each(ele => ele.isRight() ? newLogDoc.success.push(ele.right) : newLogDoc.failure.push(ele.left))
    );

    const fLen = newLogDoc.failure.length;

    return this.logPriceUpdateSrv.create(newLogDoc)
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
  // ---------------------------------------------------------

}