import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarketService } from '../market/market.service';
import { UserService } from 'src/database/user/user.service';
import { AssetSubscriptionService } from 'src/database/assetSubscription/assetSubscription.service';
import { User } from 'src/database/user/user.entity';
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { EnvKey } from 'src/common/enum/envKey.emun';
import { SkillPayload } from './interface/skillPayload.interface';
import { SkillResponse } from './response/skill.response';
import * as F from '@fxts/core';

@Injectable()
export class KakaoChatbotService {

  private readonly logger = new Logger(KakaoChatbotService.name);

  private readonly KAKAO_CHATBOT_VERSION
  = this.configService.get(EnvKey.KAKAO_CHATBOT_VERSION, '2.0', { infer: true });

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly marketService: MarketService,
    private readonly userSrv: UserService,
    private readonly assetSubscriptionSrv: AssetSubscriptionService,
  ) {}

  public async subscribeAsset(
    body: SkillPayload
  ): Promise<SkillResponse> {
    const botUserKey = body.userRequest.user.properties.botUserKey;
    if (!botUserKey) { // 봇 유저 식별 불가능
      this.logger.error(
        'userRequest?.user.properties.botUserKey is not exist in SkillPayload',
        `SkillPayload: ${JSON.stringify(body)}`,
      );
      return {
        version: this.KAKAO_CHATBOT_VERSION,
        template: {
          outputs: [
            {
              simpleText: {
                text: "죄송해요. 당신이 누구인지 확인하지 못했어요. \n이 문제는 제가 확인했으니 곧 고쳐질 거예요!"
              },
            },
          ],
        },
      };
    }
    const userId = await this.getUserId(botUserKey);

    const ticker = body.action.params['ticker']!.toUpperCase(); //
    const price = await this.marketService.getPrice(ticker, userId.toString());
    if (!price) { // Asset 찾을 수 없음
      return {
        version: this.KAKAO_CHATBOT_VERSION,
        template: {
          outputs: [
            {
              textCard: {
                title: "죄송해요. 구독하지 못했어요.",
                description: `${ticker} 를 찾을 수 없었어요. \n혹시 잘못 입력하셨으면 다시 시도해 보세요. \n만약 올바르게 입력하여도 제가 찾지 못한 거라면, 아래 신고하기 버튼을 통해 제게 알려주세요!`,
                buttons: [
                  {
                    label: "신고하기",
                    action: "block",
                    blockId: "5f6f6c0a4b738c0001e4e7e1", //
                    extra: {
                      ticker,
                    },
                  },
                ],
              },
            },
          ],
        },
      };
    }

    /* 찾은 Asset 을 유저가 한번 확인하고 구독을 컴펌받는게 아마 더 좋은 UX 임.
    Asset 정보를 마켓서버에서 가져올 수 있도록 하자
    더 나아가서는, 티커가 아닌 이름이나 이름의 일부분으로도 Asset 을 찾아와서 컨펌받아야 함 */

    // Todo: 조건문에 따른 3가지 쿼리 호출 제거하고 하나의 쿼리에서 처리해보고 뭐가 더 나은지 비교하기
    const record = await this.assetSubscriptionSrv.readOneAcivate(userId, ticker);
    if (record !== null && record.activate === true) {
      const text = "이미 구독하고 있어요!";
      return {
        version: this.KAKAO_CHATBOT_VERSION,
        template: {
          outputs: [
            {
              simpleText: {
                text,
              },
            },
          ],
        },
        data: { ...price, text },
      };
    }
    
    try {
      if (record !== null && record.activate === false) {
        await this.assetSubscriptionSrv.updateOneActivate(userId, ticker, true);
      } else {
        await this.assetSubscriptionSrv.createOne(userId, ticker);
      }
      const text = `${ticker} 구독 성공!`;
      return {
        version: this.KAKAO_CHATBOT_VERSION,
        template: {
          outputs: [
            {
              simpleText: {
                text,
              },
            },
          ],
        },
        data: { ...price, text },
      };
    } catch (err: any) {
      this.logger.error(
        `assetSubscriptionSrv.createOne() || .updateOneActivate() failed \nuserId: ${userId}, ticker: ${ticker}`,
        err.stack as string,
      );
      const text = "죄송해요. 구독하지 못했어요. \n제가 확인했으니 이 문제는 곧 고쳐질 거예요!";
      return {
        version: this.KAKAO_CHATBOT_VERSION,
        template: {
          outputs: [
            {
              simpleText: {
                text,
              },
            },
          ],
        },
        data: { ...price, text },
      };
    }
  }

  public async cancelAssetSubscription(
    body: SkillPayload
  ): Promise<SkillResponse> {
    const botUserKey = body.userRequest.user.properties.botUserKey;
    if (!botUserKey) { // 봇 유저 식별 불가능
      this.logger.error(
        'userRequest?.user.properties.botUserKey is not exist in SkillPayload',
        `SkillPayload: ${JSON.stringify(body)}`,
      );
      const text = "죄송해요. 당신이 누구인지 확인하지 못했어요. \n제가 확인했으니 이 문제는 곧 고쳐질 거예요!";
      return {
        version: this.KAKAO_CHATBOT_VERSION,
        template: {
          outputs: [
            {
              simpleText: {
                text,
              },
            },
          ],
        },
        data: { text },
      };
    }
    const userId = await this.getUserId(botUserKey);
    const ticker = body.action.params['ticker']!.toUpperCase(); //
    try {
      const record = await this.assetSubscriptionSrv.updateOneActivate(userId, ticker, false);
      if (record !== null) {
        const text = `${ticker} 구독 취소 성공!`;
        return {
          version: this.KAKAO_CHATBOT_VERSION,
          template: {
            outputs: [
              {
                simpleText: {
                  text,
                },
              },
            ],
          },
          data: { ticker, text },
        };
      } else { // 구독중이지 않음
        const text = "구독중이 아니에요!";
        return {
          version: this.KAKAO_CHATBOT_VERSION,
          template: {
            outputs: [
              {
                simpleText: {
                  text,
                },
              },
            ],
          },
          data: { ticker, text },
        };
      }
    } catch (err: any) {
      this.logger.error(
        'assetSubscriptionSrv.updateOneActivate() failed',
        `userId: ${userId}, ticker: ${ticker}`,
        err.stack,
      );
      const text = "죄송해요. 구독을 취소하지 못했어요. \n제가 확인했으니 이 문제는 곧 고쳐질 거예요!";
      return {
        version: this.KAKAO_CHATBOT_VERSION,
        template: {
          outputs: [
            {
              simpleText: {
                text,
              },
            },
          ],
        },
        data: { ticker, text },
      };
    }
  }

  public async getAssetSubscriptions(
    body: SkillPayload
  ): Promise<SkillResponse> {
    const botUserKey = body.userRequest.user.properties.botUserKey;
    if (!botUserKey) { // 봇 유저 식별 불가능
      this.logger.error(
        'userRequest?.user.properties.botUserKey is not exist in SkillPayload',
        `SkillPayload: ${JSON.stringify(body)}`,
      );
      const text = "죄송해요. 당신이 누구인지 확인하지 못했어요. \n제가 확인했으니 이 문제는 곧 고쳐질 거예요!";
      return {
        version: this.KAKAO_CHATBOT_VERSION,
        template: {
          outputs: [
            {
              simpleText: {
                text,
              },
            },
          ],
        },
        data: { text },
      };
    }
    const userId = await this.getUserId(botUserKey);
    // 구독 조회하기
    const subscriptionTickerArr = await this.assetSubscriptionSrv.readActivatedTickersByUserId(userId);
    if (subscriptionTickerArr.length === 0) {
      const text = "구독중인것이 없네요.";
      return {
        version: this.KAKAO_CHATBOT_VERSION,
        template: {
          outputs: [
            {
              simpleText: {
                text,
              },
            },
          ],
        },
        data: { text },
      };
    }

    const assets = await F.pipe(
      subscriptionTickerArr, F.toAsync,
      F.map(async (ticker) => {
        const price = await this.marketService.getPrice(ticker, userId.toString());
        return price && Object.assign(price, {ticker});
      }),
      F.filter((price) => price !== undefined) as <T>(arr: AsyncIterableIterator<undefined | T>) => AsyncIterableIterator<T>,
      F.toArray,
    );

    const text = assets.map((asset) => {
      return `${asset.ticker} ${asset.price}${this.getCurrencySign(asset.currency)} (${asset.marketDate})`;
    }).join('\n');

    return {
      version: this.KAKAO_CHATBOT_VERSION,
      template: {
        outputs: [
          {
            simpleText: {
              text,
            },
          },
        ],
      },
      data: { assets, text },
    };
  }

  private async getUserId(botUserKey: string): Promise<User['id']> {
    const userId = await this.userSrv.readOneIdByBotUserKey(botUserKey);
    if (userId !== null) {
      return userId;
    } else {
      return (await this.userSrv.createOneByBotUserKey(botUserKey)).id;
    }
  }

  // Todo: Refac
  public async inquire(body: SkillPayload): Promise<SkillResponse> {
    let kakaoText: string = '';
    const ticker = body.action.params['ticker']!.toUpperCase();
    const price = await this.marketService.getPrice(
      ticker,
      body.userRequest?.user.id
    ).then(p => p && (kakaoText = `${(p.price + Number.EPSILON).toFixed(2)}${this.getCurrencySign(p.currency)} (${p.marketDate})`, Object.assign(p, {ticker}))
    ).catch((err): undefined => (kakaoText = err.message, undefined));

    return {
      version: this.KAKAO_CHATBOT_VERSION,
      template: {
        outputs: [
          {
            simpleText: {
              text: kakaoText
            },
          },
        ],
      },
      data: { ...price, kakaoText },
    };
  }

  // Todo: Currency Enum 만들어서 쓰기
  // Todo: 메서드 추출하기
  private getCurrencySign(currency: string, signDefault = "") {
    switch (currency) {
      case 'USD':
        return ' $';
      case 'EUR':
        return ' €';
      case 'JPY':
        return ' ¥';
      case 'GBP':
        return ' £';
      case 'CNY':
        return ' ¥';
      case 'KRW':
        return ' ₩';
      default:
        return signDefault;
    }
  }

}
