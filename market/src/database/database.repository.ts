import { Injectable, Logger } from "@nestjs/common";
import { curry, each, map, pipe, toArray, toAsync } from "@fxts/core";
import { Either } from "src/common/class/either";
import mongoose, { ClientSession } from "mongoose";
import { StandardUpdatePriceResult } from "src/common/interface/updatePriceResult.interface";
import { Log_priceUpdateService } from "./log_priceUpdate/log_priceUpdate.service";
import { Yf_infoService } from "./yf_info/yf_info.service";
import { ExchangeService } from "./exchange/exchange.service";

@Injectable()
export class DBRepository {

  private readonly logger = new Logger(DBRepository.name);

  constructor(
    private readonly log_priceUpdateSrv: Log_priceUpdateService,
    private readonly exchangeSrv: ExchangeService,
    private readonly yf_infoSrv: Yf_infoService,
  ) {}

  readSymbolArr = async (filter: object) =>
    (await this.yf_infoSrv.find(filter, '-_id symbol'))
      .map(doc => doc.symbol);

  /**
  * ### ISO_Code 로 조회 => [symbol, price, currency][]
  * 
  * Todo: Refac - Exchange 리팩터링 후 억지로 끼워맞춤
  */
  readPriceByISOcode = async (ISO_Code: string) =>
    this.yf_infoSrv.findPricesByExchange((await this.exchangeSrv.readOneByPk(ISO_Code))!.ISO_TimezoneName) //
      .then(arr => arr.map(ele => [ele.symbol, ele.regularMarketLastClose, ele.quoteType === "INDEX" ? "INDEX" : ele.currency]));

  /**
  * ### TODO - Refac
  * - 가격 업데이트
  * - StatusPrice 업데이트
  * - 업데이트 로그 생성
  */
  updatePriceStandard = async (
    arr: Either<YfPriceError, UpdatePriceSet>[],
    ISO_Code: string,
    previous_close: string,
    startTime: string,
    launcher: LogPriceUpdate["launcher"]
  ): Promise<StandardUpdatePriceResult> => {
    const session = await mongoose.connections[1].startSession(); // 1번째 커넥션을 쓴다는 표현이 별로인데?
    try {
      session.startTransaction();
      const updateResult = {
        updatePriceResult: await pipe(
          arr, toAsync,
          map(ele => ele.flatMap(this.updatePrice(session))),
          toArray
        ),
        updateSatusPriceResult: await this.updateExchagneByRegularUpdater(ISO_Code, previous_close, session),
        startTime,
        endTime: new Date().toISOString()
      };
      // @ts-ignore // exchange 리팩터링 후 문제
      await this.createLogPriceUpdate(launcher, true, ISO_Code, updateResult, session);
      await session.commitTransaction();
      // @ts-ignore // exchange 리팩터링 후 문제
      return updateResult;
    } catch (error) {
      this.logger.error(error);
      await session.abortTransaction(); // 에러가 있다면 commitTransaction 전에 에러이기때문에 지금 상태로는 없어도 아무이상없는것같음?
      throw error;
    } finally {
      session.endSession();
    }
  };

  private updatePrice = curry((session: ClientSession, updatePriceSet: UpdatePriceSet):
    Promise<Either<UpdatePriceError, UpdatePriceSet>> => {
    return this.yf_infoSrv.updatePrice(...updatePriceSet, session)
      .then(res => {
        // const successRes = {
        //     acknowledged: true,
        //     modifiedCount: 1,
        //     upsertedId: null,
        //     upsertedCount: 0,
        //     matchedCount: 1
        // }
        if (
          res.acknowledged &&
          res.modifiedCount === 1 &&
          res.upsertedId === null &&
          res.upsertedCount === 0 &&
          res.matchedCount === 1
        ) {
          return Either.right(updatePriceSet);
        } else {
          return Either.left({ error: "updateOne error", ticker: updatePriceSet[0], res });
        };
      });
  });


  private updateExchagneByRegularUpdater = (ISO_Code: string, previous_close: string, session: ClientSession) =>
    this.exchangeSrv.updateMarketDateByPk(
      ISO_Code,
      new Date(previous_close).toISOString()
    );

  private createLogPriceUpdate = (
    launcher: LogPriceUpdate["launcher"],
    isStandard: boolean,
    key: string | Array<string | Object>,
    updateResult: StandardUpdatePriceResult,
    session: ClientSession
  ) => {
    const newLogDoc: LogPriceUpdate = {
      launcher,
      isStandard,
      key,
      success: [],
      failure: [],
      startTime: updateResult.startTime,
      endTime: updateResult.endTime,
      duration: new Date(updateResult.endTime).getTime() - new Date(updateResult.startTime).getTime()
    }
    pipe(
      updateResult.updatePriceResult,
      each(ele => ele.isRight() ?
        newLogDoc.success.push(ele.getRight) : newLogDoc.failure.push(ele.getLeft)
      )
    );
    const fLen = newLogDoc.failure.length;
    return this.log_priceUpdateSrv.create(newLogDoc, session).then(_ => {
      this.logger.verbose(`${launcher === "scheduler" || launcher === "initiator" ? key : launcher} : Log_priceUpdate Doc Created${fLen ? ` (${fLen} failed)` : ''}`);
    }).catch((error) => {
      this.logger.error(`${launcher} : Failed to Create Log_priceUpdate Doc!!!`);
      throw error;
    });
  }

}