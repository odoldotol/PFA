import { Injectable } from "@nestjs/common";
import {
  FinancialAssetCore,
  MarketDate,
  Ticker
} from "src/common/interface";
import {
  calculateChangeRate,
  currencyToSign,
  to2Decimal
} from "src/common/util";

@Injectable()
export class TextService {

  constructor() {}

  public unexpectedError(): string {
    return "죄송해요. 제가 예상치 못한 문제가 발생한 것 같아요.\n하지만 제가 지금 확인했으니 곧 고쳐질 거예요!";
  }

  public timeoutError(): string {
    return "죄송해요. 제가 작업을 처리하는 데에 너무 오랜 시간이 필요했어요.\n다시 시도해 주세요.";
  }

  public invalidTickerError(): string {
    return "올바르지 않은 티커 같아요.\n다시 확인해 주세요.";
  }

  public notFoundTickerAssetInquiryCard(
    ticker: Ticker
  ) {
    return {
      title: `${ticker} 에 대한 정보를 찾을 수 없었어요.`,
      description: `혹시 잘못 입력하셨으면 아래 다시 찾기 버튼으로 다시 시도해 보세요.\n만약 올바르게 입력하셨어도 제가 찾지 못한 거라면, 아래 신고하기 버튼으로 제게 알려주세요!`,
    };
  }

  /**
   * @todo refac
   */
  public assetInquiryCard(
    asset: FinancialAssetCore
  ) {
    const name = asset.longName || asset.shortName || '--';
    return {
      title: asset.symbol,
      description: `${name}\n${this.getPriceStr(asset)}`, // marketDate 보여줘야함? marketExchange 받아오는것 검토?
    };
  }

  public assetSubscribed(ticker: Ticker): string {
    return `${ticker} 구독을 시작했어요!`;
  }

  public assetUnsubscribed(ticker: Ticker): string {
    return `${ticker} 구독을 취소했어요!`;
  }

  public notSubscribedAsset(ticker: Ticker): string {
    return `${ticker} 구독중이 아니에요!`;
  }

  public noSubscribedAsset(): string {
    return "구독중인것이 없네요...";
  }

  public subscribedAssetInquiry(assets: FinancialAssetCore[]): string {
    return assets.map((asset) => {
      // 한 줄을 넘어가면 가독성 떨어짐에 주의.
      // Symbol 보단 이름이 필요함.
      // Month/Day 필요없지 않나?
      return `${asset.symbol} ${this.getPriceStr(asset)} (${this.getMonthSlashDayStr(asset.marketDate)})`;
    }).join('\n');
  }

  public reported(): string {
    return "신고해주셔서 감사해요!";
  }

  private getMonthSlashDayStr(marketDate: MarketDate): string {
    return marketDate.split('-').slice(1).join('/');
  }

  private getPriceStr(asset: FinancialAssetCore): string {
    return `${to2Decimal(asset.regularMarketLastClose)}${currencyToSign(asset.currency)} ${this.getChangeRateStr(asset)}`;
  };

  private getChangeRateStr({
    regularMarketLastClose,
    regularMarketPreviousClose
  }: FinancialAssetCore): string {
    if (!regularMarketPreviousClose) { // 0 이거나 null 일 경우
      return '--';
    } else {
      const percentRate = calculateChangeRate(
        regularMarketPreviousClose,
        regularMarketLastClose
      );
      return `${0 < percentRate ? '+' : ''}${to2Decimal(percentRate)}%`;
    }
  }
}
