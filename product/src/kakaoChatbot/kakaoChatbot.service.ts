import {
  Injectable,
  Logger
} from '@nestjs/common';
import {
  AssetSubscriptionService,
} from 'src/database';
import { YahooFinanceTickerService } from 'src/ticker';
import { FinancialAssetService } from 'src/financialAsset';
import { AuthService } from './auth.service';
import { SkillResponseService } from './skillResponse.service';
import {
  AssetSubscriptionDto,
  InquireAssetDto,
  InquireAssetV2Dto,
  ReportTickerDto,
  SkillPayloadDto,
} from './dto';
import { SkillResponse } from './skillResponse/v2';
import {
  FinancialAssetCore,
  InquireQuery,
  Ticker
} from 'src/common/interface';
import { chatbotListMenuButtons } from './const';
import * as F from '@fxts/core';

@Injectable()
export class KakaoChatbotService {

  private readonly logger = new Logger(KakaoChatbotService.name);

  constructor(
    private readonly yahooFinanceTickerSrv: YahooFinanceTickerService,
    private readonly financialAssetSrv: FinancialAssetService,
    private readonly authSrv: AuthService,
    private readonly assetSubscriptionSrv: AssetSubscriptionService,
    private readonly skillResponseSrv: SkillResponseService,
  ) {}

  public async inquireAsset_v2(
    skillPayload: InquireAssetDto
  ): Promise<SkillResponse> {
    const userId = await this.authSrv.getUserId(skillPayload);
    const query = this.getQueryToInqire(skillPayload);

    // 중복 제거
    switch (query) {
      case chatbotListMenuButtons.inquireSubscribedAsset.title:
        return this.inquireSubscribedAsset(skillPayload, userId);
      case chatbotListMenuButtons.more.title:
        return this.skillResponseSrv.more();
    }

    if (this.yahooFinanceTickerSrv.isStyle(query)) {
      const yahooFinanceTickerStyleQuery = query.toUpperCase();
      const financialAsset = await this.financialAssetSrv.readCache(yahooFinanceTickerStyleQuery);
      if (financialAsset === null) {
        const tickerArr = await this.yahooFinanceTickerSrv.readCache(query);
        if (tickerArr === null) {
          const fetchPm = this.financialAssetSrv.fetchFromMarket(yahooFinanceTickerStyleQuery);
          const delay =  F.delay(1000); // delay ms
          try {
            const result1 = await Promise.race([fetchPm, delay]);
            if (typeof result1 == 'object') {
              const isSubscribed = await this.assetSubscriptionSrv.readOneAcivate(
                userId,
                yahooFinanceTickerStyleQuery
              ).then(r => r !== null && r.activate);
              return this.skillResponseSrv.assetInquiry(result1, isSubscribed);
            }
          } catch (error) {
            // Notfound 는 패스하고 그외 에러는 로깅?
          }

          const tickerArrPm = this.yahooFinanceTickerSrv.fetchFromModel(query);

          try {
            const result2 = await Promise.any([fetchPm, tickerArrPm]);
            if (Array.isArray(result2)) {
              const financialAssetArr = await F.pipe(
                result2,
                F.toAsync,
                F.map(this.financialAssetSrv.inquire.bind(this)), // todo - (A), Notfound 처리
                F.concurrent(result2.length),
                F.toArray,
              );
              return this.skillResponseSrv.assetInquiry_v2(financialAssetArr); //

            } else {
              const isSubscribed = await this.assetSubscriptionSrv.readOneAcivate(
                userId,
                yahooFinanceTickerStyleQuery
              ).then(r => r !== null && r.activate);
              return this.skillResponseSrv.assetInquiry(result2, isSubscribed);
            }
          } catch (error) {
            // fetchPm 의 Notfound 는 패스하고 그외 에러는 로깅?
            return this.skillResponseSrv.assetInquiry_v2([]); // tickerArrPm 의 exception 에 때라서 최종 응답
          }

        } else {
          const financialAssetArr = await F.pipe(
            tickerArr,
            F.toAsync,
            F.map(this.financialAssetSrv.inquire.bind(this)), // todo - (A), Notfound 처리
            F.concurrent(tickerArr.length),
            F.toArray,
          );
          return this.skillResponseSrv.assetInquiry_v2(financialAssetArr); // 
        }
      } else {
        const isSubscribed = await this.assetSubscriptionSrv.readOneAcivate(
          userId,
          yahooFinanceTickerStyleQuery
        ).then(r => r !== null && r.activate);

        return this.skillResponseSrv.assetInquiry(financialAsset, isSubscribed);
      }
    } else {
      const tickerArr = await this.yahooFinanceTickerSrv.inquire(query);
      const financialAssetArr = await F.pipe(
        tickerArr,
        F.toAsync,
        F.map(this.financialAssetSrv.inquire.bind(this)), // todo - (A), Notfound 처리
        F.concurrent(tickerArr.length),
        F.toArray,
      );
      return this.skillResponseSrv.assetInquiry_v2(financialAssetArr); //
    }
  }

  public async inquireAsset(
    skillPayload: InquireAssetDto
  ): Promise<SkillResponse> {
    const userId = await this.authSrv.getUserId(skillPayload);
    const ticker = this.getTickerToInqire(skillPayload);

    // 티커를 입력하지않고 메뉴 버튼을 클릭하는 경우가 많아서 이를 처리하는 부분. (inquireAsset 버튼을 다시 누르는 경우의 처리는 구조적으로 복잡하여 처리하지 않고 있음)
    switch (ticker) {
      case chatbotListMenuButtons.inquireSubscribedAsset.title:
        return this.inquireSubscribedAsset(skillPayload, userId);
      case chatbotListMenuButtons.more.title:
        return this.skillResponseSrv.more();
    }

    // Todo: failedTicker 재시도시 응답.

    const asset = await this.financialAssetSrv.inquire(ticker);

    const isSubscribed = await this.assetSubscriptionSrv.readOneAcivate(
      userId,
      ticker
    ).then(r => r !== null && r.activate);

    return this.skillResponseSrv.assetInquiry(asset, isSubscribed);
  }

  /**
   * 일반적으로 구독중이 아닌 경우에만 진입한다고 가정
   * - 구독중 진입시 아무 작업없이 정상응답
   */
  public async addAssetSubscription(
    skillPayload: AssetSubscriptionDto
  ) {
    let created = false;
    let updated = false;

    const userId = await this.authSrv.getUserId(skillPayload);
    const ticker = this.getTickerFromClientExtra(skillPayload);

    // Todo: 조건에 따른 두번의 쿼리를 한번의 쿼리로 합치고 비교해보기
    const record = await this.assetSubscriptionSrv.readOneAcivate(
      userId,
      ticker
    );

    if (record === null) {
      await this.assetSubscriptionSrv.createOne(userId, ticker);
      created = true;
    } else if (record.activate === false) {
      await this.assetSubscriptionSrv.updateOneActivate(
        userId,
        ticker,
        true
      );
      updated = true;
    }

    return {
      created,
      updated,
      data: this.skillResponseSrv.assetSubscribed(ticker)
    };
  }

  /**
   * 일반적으로 구독중인 경우에만 진입한다고 가정
   * - 비 구독중 진입시 아무 작업없이 정상응답.
   */
  public async cancelAssetSubscription(
    skillPayload: AssetSubscriptionDto
  ): Promise<SkillResponse> {
    const userId = await this.authSrv.getUserId(skillPayload);
    const ticker = this.getTickerFromClientExtra(skillPayload);

    // Todo: 조건에 따른 두번의 쿼리를 한번의 쿼리로 합치고 비교해보기
    const record = await this.assetSubscriptionSrv.readOneAcivate(
      userId,
      ticker
    );

    if (record?.activate === true) {
      await this.assetSubscriptionSrv.updateOneActivate(
        userId,
        ticker,
        false
      );
    }

    return this.skillResponseSrv.assetUnsubscribed(ticker);
  }

  public async inquireSubscribedAsset(
    skillPayload: SkillPayloadDto,
    givenUserId?: number
  ): Promise<SkillResponse> {
    const userId = givenUserId || await this.authSrv.getUserId(skillPayload);

    let { assets, cursor } = this.getAssetsFromClientExtra(skillPayload);
    if (assets === undefined) {
      const subscriptionTickerArr
      = await this.assetSubscriptionSrv.readActivatedTickersByUserId(userId);
  
      if (subscriptionTickerArr.length === 0) {
        return this.skillResponseSrv.noSubscribedAsset();
      }
  
      assets = await F.pipe(
        subscriptionTickerArr, F.toAsync,
        F.map(ticker => this.financialAssetSrv.inquire(ticker, userId.toString())),
        F.concurrent(subscriptionTickerArr.length),
        F.toArray,
      );
    }

    return this.skillResponseSrv.subscribedAssetInquiry(assets, cursor);
  }

  private getAssetsFromClientExtra(
    skillPayload: SkillPayloadDto
  ): {
    assets: FinancialAssetCore[] | undefined,
    cursor: number | undefined
  } {
    const result = {
      assets: skillPayload.action.clientExtra["assets"] as FinancialAssetCore[] | undefined,
      cursor: skillPayload.action.clientExtra["cursor"] as number | undefined
    };

    if (
      (result.assets === undefined && result.cursor === undefined) ||
      (result.assets !== undefined && result.cursor !== undefined)
    ) {
      return result;
    } else {
      throw new Error('Invalid clientExtra (assets, cursor)');
    }
  }

  public async reportTicker(
    skillPayload: ReportTickerDto
  ): Promise<SkillResponse> {
    const userId = await this.authSrv.getUserId(skillPayload);
    const ticker = this.getTickerFromClientExtra(skillPayload);
    const reason = skillPayload.action.clientExtra.reason;

    this.logger.warn(
      `Report: ${ticker}\nuserId: ${userId}\nreason: ${reason.message}\n${reason.stack}`
    );

    return this.skillResponseSrv.tickerReported();
  }

  private getTickerToInqire(
    skillPayload: InquireAssetDto
  ): Ticker {
    const result = skillPayload.action.params?.ticker || skillPayload.action.clientExtra?.ticker;

    if (result === undefined) {
      throw new Error('Ticker is not defined');
    }

    return result;
  }

  private getQueryToInqire(
    skillPayload: InquireAssetV2Dto
  ): InquireQuery {
    const result = skillPayload.action.params?.query || skillPayload.action.clientExtra?.query;

    if (result === undefined) {
      throw new Error('Query is not defined');
    }

    return result;
  }

  private getTickerFromClientExtra(
    skillPayload: AssetSubscriptionDto
  ): Ticker {
    return skillPayload.action.clientExtra.ticker;
  }

}
