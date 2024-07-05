import { Injectable, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import {
  Database_FinancialAssetService,
  Database_ExchangeService,
  LogPriceUpdateService
} from "../";
import { Log_priceUpdate } from "../log_priceUpdate/log_priceUpdate.schema";
import { ExchangeCore, FulfilledYfPrice } from "src/common/interface";
import { Launcher } from "src/common/enum";
import Either, * as E from "src/common/class/either";

@Injectable()
export class Database_UpdaterService {

  private readonly logger = new Logger(Database_UpdaterService.name);

  constructor(
    private readonly financialAssetSrv: Database_FinancialAssetService,
    private readonly exchangeSrv: Database_ExchangeService,
    private readonly dataSource: DataSource,
    private readonly logPriceUpdateSrv: LogPriceUpdateService
  ) {}

  // Todo: Refac
  public async update(
    updateEitherArr: readonly Either<any, FulfilledYfPrice>[],
    exchange: ExchangeCore,
  ): Promise<Either<any, FulfilledYfPrice>[]> {
    const updateRes = await this.updateTx(
      E.getRightArray(updateEitherArr),
      exchange
    );

    // Todo: Refac -----------------------------------------
    // financialAssetSrv.updatePriceMany 에서 부터 성공 실패를 Either 로 반환하도록 해야한다.
    const symbolToUpdateResEleMap = new Map(updateRes.map(e => [e.symbol, e]));
    const turnLeftIfUpdateFailed = (either: Either<any, FulfilledYfPrice>) => {
      if (either.isRight() && symbolToUpdateResEleMap.get(either.right.symbol) === undefined)
      return Either.left<any, FulfilledYfPrice>({
        message: 'updatePriceMany failure',
        data: either.right
      });
      else return either;
    };

    const result: Either<any, FulfilledYfPrice>[]
    = updateEitherArr.map(turnLeftIfUpdateFailed);
    // -----------------------------------------------------
    
    return result;
  }

  /**
   * Todo: 트렌젝션이 성공하면 가격 업데이트의 성공 실패 를 반환해야 한다.
   */
  private async updateTx(
    fulfilledYfPriceArr: readonly FulfilledYfPrice[],
    exchange: ExchangeCore,
  ): Promise<FulfilledYfPrice[]> {
    let updateRes: FulfilledYfPrice[] = [];
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction("REPEATABLE READ");
      await this.financialAssetSrv.updatePriceMany(
        fulfilledYfPriceArr,
        exchange.marketDate,
        queryRunner
      ).then(res => updateRes = res);
      await this.exchangeSrv.updateMarketDateByPk(
        exchange.isoCode,
        exchange.marketDate,
        queryRunner
      );
      // throw new Error('Repeatable Test');
      await queryRunner.commitTransaction();
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`${exchange.isoCode} : Transaction Rollback!!! ${err}`, err.stack);
    } finally {
      await queryRunner.release();
    }
    return updateRes;
  }

  // Todo: Refac ---------------------------------------------
  public createLog(
    newLogDoc: Log_priceUpdate
  ) {
    const { launcher, key } = newLogDoc;
    const fLen = newLogDoc.failure.length;

    return this.logPriceUpdateSrv.create(newLogDoc)
    .then(_ => {
      this.logger.verbose(
        `${launcher === Launcher.SCHEDULER || launcher === Launcher.INITIATOR ? key : launcher} : Log_priceUpdate Doc Created${fLen ? ` (${fLen} failed)` : ''}`
      );
    })
    .catch(err => {
      this.logger.error(err, err.stack);
      this.logger.warn(`${launcher} : Failed to Create Log_priceUpdate Doc!!!`);
    });
  }
  // ---------------------------------------------------------

}
