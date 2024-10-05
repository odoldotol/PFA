import {
  Injectable,
  Logger
} from '@nestjs/common';
import {
  AssetSubscriptionService,
} from 'src/database';
import { FinancialAssetService } from 'src/financialAsset';
import { AuthService } from './auth.service';
import { SkillResponseService } from './skillResponse.service';
import {
  AssetSubscriptionDto,
  InquireAssetDto,
  ReportTickerDto,
  SkillPayloadDto,
} from './dto';
import { SkillResponse } from './skillResponse/v2';
import { Ticker } from 'src/common/interface';
import * as F from '@fxts/core';

@Injectable()
export class KakaoChatbotService {

  private readonly logger = new Logger(KakaoChatbotService.name);

  constructor(
    private readonly financialAssetSrv: FinancialAssetService,
    private readonly authSrv: AuthService,
    private readonly assetSubscriptionSrv: AssetSubscriptionService,
    private readonly skillResponseSrv: SkillResponseService,
  ) {}

  public async inquireAsset(
    skillPayload: InquireAssetDto
  ): Promise<SkillResponse> {
    const userId = await this.authSrv.getUserId(skillPayload);
    const ticker = this.getTickerFromParams(skillPayload);

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
    skillPayload: SkillPayloadDto
  ): Promise<SkillResponse> {
    const userId = await this.authSrv.getUserId(skillPayload);
    const subscriptionTickerArr
    = await this.assetSubscriptionSrv.readActivatedTickersByUserId(userId);

    if (subscriptionTickerArr.length === 0) {
      return this.skillResponseSrv.noSubscribedAsset();
    }

    const assets = await F.pipe(
      subscriptionTickerArr, F.toAsync,
      F.map(ticker => this.financialAssetSrv.inquire(ticker, userId.toString())),
      F.concurrent(subscriptionTickerArr.length),
      F.toArray,
    );

    return this.skillResponseSrv.subscribedAssetInquiry(assets);
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

  private getTickerFromParams(
    skillPayload: InquireAssetDto
  ): Ticker {
    return skillPayload.action.params.ticker;
  }

  private getTickerFromClientExtra(
    skillPayload: AssetSubscriptionDto
  ): Ticker {
    return skillPayload.action.clientExtra.ticker;
  }

}
