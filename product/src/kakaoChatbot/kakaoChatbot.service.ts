import { Injectable, Logger } from '@nestjs/common';
import { MarketApiService } from 'src/marketApi';
import { AssetService } from 'src/asset';
import {
  AssetSubscriptionService,
  UserService
} from 'src/database';
import { SkillResponseService } from './skillResponse.service';
import { User } from 'src/database/user/user.entity';
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
    private readonly marketApiSrv: MarketApiService, // Todo: 제거
    private readonly assetSrv: AssetService,
    private readonly userSrv: UserService,
    private readonly assetSubscriptionSrv: AssetSubscriptionService,
    private readonly skillResponseSrv: SkillResponseService,
  ) {}

  public async inquireAsset(
    skillPayload: InquireAssetDto
  ): Promise<SkillResponse> {
    const userId = await this.getUserId(skillPayload);
    const ticker = this.getTickerFromParams(skillPayload);

    // Todo: failedTicker 재시도시 응답.

    // Todo: exchange 이름도 포함되는것이 좋겠다. marketExchange 를 exchagne 에 넣어주는건 어떨지 확인해봐라.
    // Todo: Price 만이 아니라 Asset 을 Redis 에 캐싱해야함? 그리고 직전 마감과 이전 마감사이의 변화량도 계산할 수 있어야 함.
    const asset = await this.marketApiSrv.fetchFinancialAsset(ticker);

    const isSubscribed = await this.assetSubscriptionSrv.readOneAcivate(
      userId,
      ticker
    ).then(r => r !== null && r.activate);

    return this.skillResponseSrv.assetInquiry(asset, isSubscribed);
  }

  /**
   * 일반적으로 구독중이 아닌 경우에만 진입한다고 가정, 구독중에 진입시 별도의 응답 없음.
   */
  public async addAssetSubscription(
    skillPayload: AssetSubscriptionDto
  ) {
    let created = false;
    let updated = false;

    const userId = await this.getUserId(skillPayload);
    const ticker = this.getTickerFromClientExtra(skillPayload);

    // Todo: 조건에 따른 두번의 쿼리를 한번의 쿼리로 합치고 비교해보기
    const record
    = await this.assetSubscriptionSrv.readOneAcivate(userId, ticker);
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
    }
  }

  /**
   * 일반적으로 구독중인 경우에만 진입한다고 가정, 구독중이 아닌 경우에 진입시 별도 응답 있음.
   */
  public async cancelAssetSubscription(
    skillPayload: AssetSubscriptionDto
  ): Promise<SkillResponse> {
    const userId = await this.getUserId(skillPayload);
    const ticker = this.getTickerFromClientExtra(skillPayload);

    // Todo: 조건에 따른 두번의 쿼리를 한번의 쿼리로 합치고 비교해보기
    const record
    = await this.assetSubscriptionSrv.readOneAcivate(userId, ticker);
    if (record !== null) {
      await this.assetSubscriptionSrv.updateOneActivate(
        userId,
        ticker,
        false
      );
    }

    return this.skillResponseSrv.assetUnsubscribed(ticker);
  }

  /**
   * @todo asset 엔티티 리팩터링
   */
  public async inquireSubscribedAsset(
    skillPayload: SkillPayloadDto
  ): Promise<SkillResponse> {
    const userId = await this.getUserId(skillPayload);
    const subscriptionTickerArr
    = await this.assetSubscriptionSrv.readActivatedTickersByUserId(userId);

    if (subscriptionTickerArr.length === 0) {
      return this.skillResponseSrv.noSubscribedAsset();
    }

    // Todo: 엔티티 리팩터링(price -> financialAsset)
    const assets = await F.pipe(
      subscriptionTickerArr, F.toAsync,
      F.map(async ticker => Object.assign(
        (await this.assetSrv.inquirePrice(ticker, userId.toString())).data,
        { ticker }
      )),
      F.toArray,
    );

    return this.skillResponseSrv.subscribedAssetInquiry(assets);
  }

  public async reportTicker(
    skillPayload: ReportTickerDto
  ): Promise<SkillResponse> {
    const userId = await this.getUserId(skillPayload);
    const ticker = this.getTickerFromClientExtra(skillPayload);
    const reason = skillPayload.action.clientExtra.reason;

    this.logger.warn(
      `Report: ${ticker}\nuserId: ${userId}\nreason: ${reason.message}\n${reason.stack}`
    );

    return this.skillResponseSrv.tickerReported();
  }

  private async getUserId(
    skillPayload: SkillPayloadDto
  ): Promise<User['id']> {
    const botUserKey = skillPayload.userRequest.user.properties.botUserKey;
    const userId = await this.userSrv.readOneIdByBotUserKey(botUserKey);
    if (userId !== null) {
      return userId;
    } else {
      return (await this.userSrv.createOneByBotUserKey(botUserKey)).id;
    }
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
