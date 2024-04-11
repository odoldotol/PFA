import { Injectable } from "@nestjs/common";
import {
  ButtonAction,
  Data,
  SimpleTextFactory,
  SkillResponse,
  SkillResponseFactory,
  TextCardFactory
} from "./skillResponse/v2";
import {
  FinancialAssetCore,
  Ticker
} from "src/common/interface";
import { CachedPrice } from "src/common/class/cachedPrice.class";
import { MarketDate } from "src/common/class/marketDate.class";
import { currencyToSign, to2Decimal } from "src/common/util";
import { KakaoChatbotConfigService } from "src/config";

@Injectable()
export class SkillResponseService {

  constructor(
    private readonly kakaoChatbotConfigSrv: KakaoChatbotConfigService,
  ) {}

  public unexpectedError(
    exception: any,
    dataExtra?: Data
  ): SkillResponse<'simpleText'> {
    return this.singleSimpleText(this.unexpectedErrorText(), {
      exception,
      ...dataExtra,
    });
  }

  public timeoutError(
    exception: any,
    dataExtra?: Data
  ): SkillResponse<'simpleText'> {
    return this.singleSimpleText(this.timeoutErrorText(), {
      exception,
      ...dataExtra
    });
  }

  /**
   * @todo textCard 로 신고하기 버튼, 티커 도움말 버튼?
   */
  public invalidTickerError(
    exception: any,
    dataExtra?: Data
  ): SkillResponse<'simpleText'> {
    return this.singleSimpleText(this.invalidTickerErrorText(), {
      exception,
      ...dataExtra
    });
  }

  /**
   * @todo refac
   */
  public notFoundTickerAssetInquiry(
    ticker: Ticker,
    reason: any,
  ): SkillResponse<'textCard'> {
    const textOptions = this.notFoundTickerAssetInquiryText(ticker);

    return SkillResponseFactory.create({
      components: [[
        'textCard',
        TextCardFactory.create(
          textOptions,
          [[
            "다시 찾기",
            ButtonAction.BLOCK,
            this.kakaoChatbotConfigSrv.getBlockIdInquireAsset(),
            {
              failedTicker: ticker,
              reason,
            }
          ], [
            "신고하기",
            ButtonAction.BLOCK,
            this.kakaoChatbotConfigSrv.getBlockIdReport(),
            {
              ticker,
              reason,
            }
          ]]
        )
      ]],
      data: {
        title: textOptions.title,
        description: textOptions.description,
        ticker,
        reason,
      },
    });
  }

  /**
   * @todo refac
   */
  public assetInquiry(
    asset: FinancialAssetCore,
    isSubscribed: boolean,
  ): SkillResponse<'textCard'> {

    const textOptions = this.assetInquiryText(asset);

    return SkillResponseFactory.create({
      components: [[
        'textCard',
        TextCardFactory.create(
          textOptions,
          [[
            isSubscribed ? "구독 취소하기" : "구독하기",
            ButtonAction.BLOCK,
            isSubscribed ?
              this.kakaoChatbotConfigSrv.getBlockIdCancelAssetSubscription() :
              this.kakaoChatbotConfigSrv.getBlockIdSubscribeAsset(),
            {
              ticker: asset.symbol,
            }
          ], [
            "다른 찾기",
            ButtonAction.BLOCK,
            this.kakaoChatbotConfigSrv.getBlockIdInquireAsset(),
          ]]
        )
      ]],
      data: {
        title: textOptions.title,
        description: textOptions.description,
        asset,
        isSubscribed,
      },
    });
  }

  /**
   * Deprecated
   */
  public alreadySubscribedAsset(
    ticker: Ticker
  ): SkillResponse<'simpleText'> {
    return this.singleSimpleText(
      this.assetSubscribedText(ticker),
      { ticker }
    );
  }

  public assetSubscribed(
    ticker: Ticker
  ): SkillResponse<'simpleText'> {
    return this.singleSimpleText(
      this.assetSubscribedText(ticker),
      { ticker }
    );
  }

  public assetUnsubscribed(
    ticker: Ticker
  ): SkillResponse<'simpleText'> {
    return this.singleSimpleText(
      this.assetUnsubscribedText(ticker),
      { ticker }
    );
  }

  /**
   * Deprecated
   */
  public notSubscribedAsset(
    ticker: Ticker
  ): SkillResponse<'simpleText'> {
    return this.singleSimpleText(
      this.notSubscribedAssetText(ticker),
      { ticker }
    );
  }

  public noSubscribedAsset()
  : SkillResponse<'simpleText'>
  {
    return this.singleSimpleText(this.noSubscribedAssetText());
  }

  // Todo: asset 을 redis 에 캐깅한 후 Refac
  public subscribedAssetInquiry(
    assets: (CachedPrice & { ticker: string; })[]
  ): SkillResponse {
    return this.singleSimpleText(
      this.subscribedAssetInquiryText(assets),
      { assets }
    );
  }

  public tickerReported()
  : SkillResponse<'simpleText'>
  {
    return this.singleSimpleText(this.reportedText());
  }

  private singleSimpleText(
    text: string,
    dataExtra?: Data
  ): SkillResponse<'simpleText'> {
    return SkillResponseFactory.create({
      components: [[
        'simpleText', SimpleTextFactory.create(text)
      ]],
      data: {
        text,
        ...dataExtra,
      },
    });
  }

  private unexpectedErrorText(): string {
    return "죄송해요. 제가 예상치 못한 문제가 발생한 것 같아요.\n하지만 제가 지금 확인했으니 곧 고쳐질 거예요!";
  }

  private timeoutErrorText(): string {
    return "죄송해요. 제가 작업을 처리하는 데에 너무 오랜 시간이 필요했어요.\n다시 시도해 주세요.";
  }

  private invalidTickerErrorText(): string {
    return "올바르지 않은 티커 같아요.\n다시 확인해 주세요.";
  }

  /**
   * @todo refac
   */
  private notFoundTickerAssetInquiryText(
    ticker: Ticker
  ): Parameters<typeof TextCardFactory.create>[0] {
    return {
      title: `${ticker} 에 대한 정보를 찾을 수 없었어요.`,
      description: `혹시 잘못 입력하셨으면 아래 다시 찾기 버튼으로 다시 시도해 보세요.\n만약 올바르게 입력하셨어도 제가 찾지 못한 거라면, 아래 신고하기 버튼으로 제게 알려주세요!`,
    };
  }

  /**
   * @todo refac
   */
  private assetInquiryText(
    asset: FinancialAssetCore
  ): Parameters<typeof TextCardFactory.create>[0] {
    const name = asset.longName || asset.shortName || '';
    const price = `${to2Decimal(asset.regularMarketLastClose)} ${currencyToSign(asset.currency)}`;
    return {
      title: asset.symbol,
      description: `${name}\n${price}`, // marketDate 보여줘야함. marketExchange 받아오는것 검토해보기.
    };
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
