import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  EnvironmentVariables,
  FinancialAssetCore,
  Ticker
} from "src/common/interface";
import { EnvKey } from "src/common/enum/envKey.emun";
import { Button, SkillResponse } from "./response/skill.response";
import { CachedPrice } from "src/common/class/cachedPrice.class";
import { currencyToSign, to2Decimal } from "src/common/util";
import { MarketDate } from "src/common/class/marketDate.class";

@Injectable()
export class SkillResponseService {

  private readonly KAKAO_CHATBOT_VERSION
  = this.configService.get(
    EnvKey.KAKAO_CHATBOT_VERSION,
    '2.0',
    { infer: true }
  );
  private readonly KAKAO_CHATBOT_BLOCK_ID_INQUIRE_ASSET
  = this.configService.get(
    EnvKey.KAKAO_CHATBOT_BLOCK_ID_INQUIRE_ASSET,
    { infer: true }
  );
  private readonly KAKAO_CHATBOT_BLOCK_ID_REPORT
  = this.configService.get(
    EnvKey.KAKAO_CHATBOT_BLOCK_ID_REPORT,
    { infer: true }
  );
  private readonly KAKAO_CHATBOT_BLOCK_ID_SUBSCRIBE_ASSET
  = this.configService.get(
    EnvKey.KAKAO_CHATBOT_BLOCK_ID_SUBSCRIBE_ASSET,
    { infer: true }
  );
  private readonly KAKAO_CHATBOT_BLOCK_ID_CANCEL_ASSET_SUBSCRIPTION
  = this.configService.get(
    EnvKey.KAKAO_CHATBOT_BLOCK_ID_CANCEL_ASSET_SUBSCRIPTION,
    { infer: true }
  );

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    const isProduction = this.configService.get(
      EnvKey.DOCKER_ENV,
      { infer: true }
    ) === 'production';

    if (isProduction && (
      this.KAKAO_CHATBOT_BLOCK_ID_INQUIRE_ASSET === undefined ||
      this.KAKAO_CHATBOT_BLOCK_ID_REPORT === undefined ||
      this.KAKAO_CHATBOT_BLOCK_ID_SUBSCRIBE_ASSET === undefined ||
      this.KAKAO_CHATBOT_BLOCK_ID_CANCEL_ASSET_SUBSCRIPTION === undefined
    )) {
      throw new Error('KAKAO_CHATBOT_BLOCK_ID is not defined!');
    }
  }

  public unexpectedError(): SkillResponse {
    return this.simpleText(this.unexpectedErrorText());
  }

  public timeoutError(): SkillResponse {
    return this.simpleText(this.timeoutErrorText());
  }

  public failedAssetInquiry(
    ticker: Ticker,
    reason: any,
  ): SkillResponse {
    const buttons: Button[] = [
      {
        label: "다시 찾기",
        action: "block",
        blockId: this.KAKAO_CHATBOT_BLOCK_ID_INQUIRE_ASSET,
        extra: {
          failedTicker: ticker,
          reason,
        },
      },
      {
        label: "신고하기",
        action: "block",
        blockId: this.KAKAO_CHATBOT_BLOCK_ID_REPORT,
        extra: {
          ticker,
          reason,
        },
      },
    ];
    const dataExtra = {
      ticker,
      reason,
    };

    return this.textCard(
      ...this.failedAssetInquiryText(ticker),
      buttons,
      dataExtra
    );
  }

  public assetInquiry(
    asset: FinancialAssetCore,
    isSubscribed: boolean,
  ): SkillResponse {;
    const buttons: Button[] = [
      {
        label: isSubscribed ? "구독 취소하기" : "구독하기",
        action: "block",
        blockId: isSubscribed ?
          this.KAKAO_CHATBOT_BLOCK_ID_CANCEL_ASSET_SUBSCRIPTION :
          this.KAKAO_CHATBOT_BLOCK_ID_SUBSCRIBE_ASSET,
        extra: {
          ticker: asset.symbol,
        },
      },
      {
        label: "다른 찾기",
        action: "block",
        blockId: this.KAKAO_CHATBOT_BLOCK_ID_INQUIRE_ASSET,
      },
    ];
    const dataExtra = {
      asset,
      isSubscribed,
    };

    return this.textCard(
      ...this.assetInquiryText(asset),
      buttons,
      dataExtra
    );
  }

  /**
   * Deprecated
   */
  public alreadySubscribedAsset(ticker: Ticker): SkillResponse {
    return this.simpleText(this.assetSubscribedText(ticker), { ticker });
  }

  public assetSubscribed(ticker: Ticker): SkillResponse {
    return this.simpleText(this.assetSubscribedText(ticker), { ticker });
  }

  public assetUnsubscribed(ticker: Ticker): SkillResponse {
    return this.simpleText(this.assetUnsubscribedText(ticker), { ticker });
  }

  public notSubscribedAsset(ticker: Ticker): SkillResponse {
    return this.simpleText(this.notSubscribedAssetText(ticker), { ticker });
  }

  public noSubscribedAsset(): SkillResponse {
    return this.simpleText(this.noSubscribedAssetText());
  }

  // Todo: asset 을 redis 에 캐깅한 후 Refac
  public subscribedAssetInquiry(
    assets: (CachedPrice & { ticker: string; })[]
  ): SkillResponse {
    return this.simpleText(
      this.subscribedAssetInquiryText(assets),
      { assets }
    );
  }

  public reported(): SkillResponse {
    return this.simpleText(this.reportedText());
  }

  private simpleText(
    text: string,
    dataExtra?: { [k: string]: any },
  ): SkillResponse {
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
      data: {
        text,
        ...dataExtra,
      },
    };
  }

  private textCard(
    title: string,
    description: string,
    buttons: Button[],
    dataExtra?: { [k: string]: any },
  ): SkillResponse {
    return {
      version: this.KAKAO_CHATBOT_VERSION,
      template: {
        outputs: [
          {
            textCard: {
              title,
              description,
              buttons,
            },
          },
        ],
      },
      data: {
        title,
        description,
        buttons,
        ...dataExtra,
      },
    };
  }

  private unexpectedErrorText(): string {
    return "죄송해요. 제가 예상치 못한 문제가 발생한 것 같아요.\n하지만 제가 지금 확인했으니 곧 고쳐질 거예요!";
  }

  private timeoutErrorText(): string {
    return "죄송해요. 제가 작업을 처리하는 데에 너무 오랜 시간이 필요했어요.\n다시 시도해 주세요.";
  }

  private failedAssetInquiryText(
    ticker: Ticker
  ): [string, string]  {
    return [
      `${ticker} 에 대한 정보를 찾을 수 없었어요.`,
      `혹시 잘못 입력하셨으면 아래 다시 찾기 버튼으로 다시 시도해 보세요.\n만약 올바르게 입력하셨어도 제가 찾지 못한 거라면, 아래 신고하기 버튼으로 제게 알려주세요!`,
    ];
  }

  private assetInquiryText(
    asset: FinancialAssetCore
  ): [string, string] {
    const name = asset.longName || asset.shortName || '';
    const price = `${to2Decimal(asset.regularMarketLastClose)} ${currencyToSign(asset.currency)}`;
    return [
      asset.symbol,
      `${name}\n${price}`, // marketDate 보여줘야함. marketExchange 받아오는것 검토해보기.
    ];
  }

  private assetSubscribedText(ticker: Ticker): string {
    return `${ticker} 구독을 시작했어요!`;
  }

  private assetUnsubscribedText(ticker: Ticker): string {
    return `${ticker} 구독을 취소했어요!`;
  }

  private notSubscribedAssetText(ticker: Ticker): string {
    return `${ticker} 구독중이 아니에요!`;
  }

  private noSubscribedAssetText(): string {
    return "구독중인것이 없네요...";
  }

  // Todo: asset 을 redis 에 캐깅한 후 Refac
  private subscribedAssetInquiryText(assets: (CachedPrice & { ticker: string; })[]): string {
    return assets.map((asset) => {
      return `${asset.ticker} ${to2Decimal(asset.price)} ${currencyToSign(asset.currency)} (${this.getMonthSlashDayStr(asset.marketDate)})`;
    }).join('\n');
  }

  private reportedText(): string {
    return "신고해주셔서 감사해요!";
  }

  private getMonthSlashDayStr(marketDate: MarketDate): string {
    return marketDate.split('-').slice(1).join('/');
  }

}
