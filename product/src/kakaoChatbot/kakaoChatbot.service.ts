import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { AssetService } from 'src/asset/asset.service';
import { UserService } from 'src/database/user/user.service';
import { AssetSubscriptionService } from 'src/database/assetSubscription/assetSubscription.service';
import { SkillResponseService } from './skillResponse.service';
import { User } from 'src/database/user/user.entity';
import { FinancialAssetCore } from 'src/common/interface';
import { SkillPayload } from './interface/skillPayload.interface';
import { SkillResponse } from './response/skill.response';
import * as F from '@fxts/core';

@Injectable()
export class KakaoChatbotService {

  private readonly logger = new Logger(KakaoChatbotService.name);

  constructor(
    private readonly assetSrv: AssetService,
    private readonly userSrv: UserService,
    private readonly assetSubscriptionSrv: AssetSubscriptionService,
    private readonly skillResponseSrv: SkillResponseService,
  ) {}

  public async inquireAsset(
    skillPayload: SkillPayload
  ): Promise<SkillResponse> {
    const ticker = this.getTickerFromActionIn(skillPayload);

    // Todo: failedTicker 재시도시 응답.

    let asset: FinancialAssetCore; // Todo: exchange 이름도 포함되는것이 좋겠다. marketExchange 를 exchagne 에 넣어주는건 어떨지 확인해봐라.
    try {
      // Todo: Price 만이 아니라 Asset 을 Redis 에 캐싱해야함. 그리고 직전 마감과 이전 마감사이의 변화량도 계산할 수 있어야 함.
      asset = await this.assetSrv.fetchFinancialAsset(ticker);
    } catch (err) {
      return this.skillResponseSrv.failedAssetInquiry(ticker, err);
    }

    const userId = await this.getUserId(this.getBotUserKey(skillPayload));
    const isSubscribed = await this.assetSubscriptionSrv.readOneAcivate(
      userId,
      ticker
    ).then(r => r !== null && r.activate);

    return this.skillResponseSrv.assetInquiry(asset, isSubscribed);
  }

  /**
   * 일반적으로 구독중이 아닌 경우에만 진입한다고 가정
   */
  public async subscribeAsset(
    skillPayload: SkillPayload
  ): Promise<SkillResponse> {
    const ticker = this.getTickerFromExtraAndContextIn(skillPayload);

    // Todo: 조건에 따른 두번의 쿼리를 한번의 쿼리로 합치고 비교해보기
    const userId = await this.getUserId(this.getBotUserKey(skillPayload));
    const updatedRecord = await this.assetSubscriptionSrv.updateOneActivate(
      userId,
      ticker,
      true
    );
    if (updatedRecord === null) {
      await this.assetSubscriptionSrv.createOne(userId, ticker);
    }
    
    return this.skillResponseSrv.assetSubscribed(ticker);
  }

  /**
   * 일반적으로 구독중인 경우에만 진입한다고 가정
   */
  public async cancelAssetSubscription(
    skillPayload: SkillPayload
  ): Promise<SkillResponse> {
    const ticker = this.getTickerFromExtraAndContextIn(skillPayload);

    const userId = await this.getUserId(this.getBotUserKey(skillPayload));
    const updatedRecord = await this.assetSubscriptionSrv.updateOneActivate(
      userId,
      ticker,
      false
    );

    if (updatedRecord !== null) {
      return this.skillResponseSrv.assetUnsubscribed(ticker);
    } else { // 일반적으로 진입하지 않을거라 예상
      return this.skillResponseSrv.notSubscribedAsset(ticker);
    }
  }

  public async inquireSubscribedAsset(
    skillPayload: SkillPayload
  ): Promise<SkillResponse> {
    const userId = await this.getUserId(this.getBotUserKey(skillPayload));
    const subscriptionTickerArr
    = await this.assetSubscriptionSrv.readActivatedTickersByUserId(userId);

    if (subscriptionTickerArr.length === 0) {
      return this.skillResponseSrv.noSubscribedAsset();
    }

    // Todo: asset 을 redis 에 캐싱한 후 리팩
    const assets = await F.pipe(
      subscriptionTickerArr, F.toAsync,
      F.map(async (ticker) => {
        const price = (await this.assetSrv.inquirePrice(ticker, userId.toString())).data!; //
        return price && Object.assign(price, {ticker});
      }),
      F.filter((price) => price !== undefined) as <T>(arr: AsyncIterableIterator<undefined | T>) => AsyncIterableIterator<T>,
      F.toArray,
    );

    return this.skillResponseSrv.subscribedAssetInquiry(assets);
  }

  public async report(
    skillPayload: SkillPayload
  ): Promise<SkillResponse> {
    const ticker = this.getTickerFromExtraAndContextIn(skillPayload);

    const userId = await this.getUserId(this.getBotUserKey(skillPayload));
    const reason = this.getReasonFromExtraIn(skillPayload);

    this.logger.warn(
      `Report: ${ticker}\nuserId: ${userId}\nreason: ${reason.message}\n${reason.stack}`
    );

    return this.skillResponseSrv.reported();
  }

  private getBotUserKey(skillPayload: SkillPayload): string {
    let botUserKey: string | undefined;
    if (typeof (botUserKey = skillPayload.userRequest.user.properties.botUserKey) === "string") {
      return botUserKey;
    } else if (
      skillPayload.userRequest.user.type === "botUserKey" &&
      typeof (botUserKey = skillPayload.userRequest.user.id) === "string"
    ) {
      return botUserKey;
    } else {
      throw new InternalServerErrorException(`Could not find botUserKey in UserRequest.`);
    }
  }

  private async getUserId(botUserKey: string): Promise<User['id']> {
    const userId = await this.userSrv.readOneIdByBotUserKey(botUserKey);
    if (userId !== null) {
      return userId;
    } else {
      return (await this.userSrv.createOneByBotUserKey(botUserKey)).id;
    }
  }

  private getTickerFromActionIn(skillPayload: SkillPayload): string {
    const ticker = skillPayload.action.params['ticker'];
    if (typeof ticker === "string") {
      return ticker.toUpperCase();
    } else {
      throw new InternalServerErrorException(`Could not find ticker in Action.`);
    }
  }

  private getTickerFromExtraAndContextIn(skillPayload: SkillPayload): string {
    let ticker: string | undefined;
    try {
      ticker = this.getTickerFromExtraIn(skillPayload);
    } catch (err) {
      try {
        ticker = this.getTickerFromContextIn(skillPayload);
      } catch (err) {
        throw new InternalServerErrorException(`Could not find ticker in ClientExtra and Contexts.`);
      }
    }
    return ticker;
  }

  private getTickerFromExtraIn(skillPayload: SkillPayload): string {
    const ticker = skillPayload.action.clientExtra['ticker'];
    if (typeof ticker === "string") {
      return ticker.toUpperCase();
    } else {
      throw new InternalServerErrorException(`Could not find ticker in ClientExtra.`);
    }
  }

  private getTickerFromContextIn(skillPayload: SkillPayload): string {
    const ticker = skillPayload.contexts[0]?.['params']?.['ticker']?.value;
    if (typeof ticker === "string") {
      return ticker.toUpperCase();
    } else {
      throw new InternalServerErrorException(`Could not find ticker in Contexts.`);
    }
  }

  private getReasonFromExtraIn(skillPayload: SkillPayload): any {
    const reason = skillPayload.action.clientExtra['reason'];
    if (reason !== undefined) {
      return reason;
    } else {
      throw new InternalServerErrorException(`Could not find reason in ClientExtra.`);
    }
  }

}
