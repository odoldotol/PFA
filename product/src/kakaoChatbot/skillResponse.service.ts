import { Injectable } from "@nestjs/common";
import { KakaoChatbotConfigService } from "src/config";
import { TextService } from "./text.service";
import {
  ButtonAction,
  CarouselFactory,
  Component,
  Data,
  ItemKey,
  SimpleImageFactory,
  SimpleTextFactory,
  SkillResponse,
  SkillResponseBuilder,
  SkillTemplateBuilder,
  TextCardBuilder,
  TextCardItemBuilder,
} from "./skillResponse/v2";
import {
  FinancialAssetCore,
  Ticker
} from "src/common/interface";
import { StorebotSurvey } from "./storebot.survey.test/storebotSurvey.schema"; // type
import { StorebotSurveyText } from "./storebot.survey.test/storebotSurvey.text"; // 의존성 해결때 꼬이지 않게 인덱스에 접근하면 안됨
import {
  isChoiceQuestion,
  Question
} from "./storebot.survey.test/question.const";
import { joinLineBreak } from "src/common/util";

@Injectable()
export class SkillResponseService {

  constructor(
    private readonly kakaoChatbotConfigSrv: KakaoChatbotConfigService,
    private readonly textSrv: TextService,
    private readonly storebotSurveyText: StorebotSurveyText,
  ) {}

  public unexpectedError(
    exception: any,
    dataExtra?: Data
  ): SkillResponse {
    return this.singleSimpleText(this.textSrv.unexpectedError(), {
      exception,
      ...dataExtra,
    });
  }

  public timeoutError(
    exception: any,
    dataExtra?: Data
  ): SkillResponse {
    return this.singleSimpleText(this.textSrv.timeoutError(), {
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
  ): SkillResponse {
    return this.singleSimpleText(this.textSrv.invalidTickerError(), {
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
  ): SkillResponse {
    const {
      title,
      description
    } = this.textSrv.notFoundTickerAssetInquiryCard(ticker);

    const component = new TextCardBuilder()
    .setTitle(title)
    .setDescription(description)
    .addButton(
      "다시 찾기",
      ButtonAction.BLOCK,
      this.kakaoChatbotConfigSrv.getBlockIdInquireAsset(),
      {
        failedTicker: ticker,
        reason,
      }
    ).addButton(
      "신고하기",
      ButtonAction.BLOCK,
      this.kakaoChatbotConfigSrv.getBlockIdReport(),
      {
        ticker,
        reason,
      }
    ).buildComponent();

    const template = new SkillTemplateBuilder()
    .addComponent(component)
    .build();

    return new SkillResponseBuilder()
    .addTemplate(template)
    .addData({
      title,
      description,
      ticker,
      reason,
    }).build();
  }

  /**
   * @todo refac
   */
  public assetInquiry(
    asset: FinancialAssetCore,
    isSubscribed: boolean,
  ): SkillResponse {
    const {
      title,
      description
    } = this.textSrv.assetInquiryCard(asset);

    const component = new TextCardBuilder()
    .setTitle(title)
    .setDescription(description)
    .addButton(
      isSubscribed ? "구독 취소하기" : "구독하기",
      ButtonAction.BLOCK,
      isSubscribed ?
        this.kakaoChatbotConfigSrv.getBlockIdCancelAssetSubscription() :
        this.kakaoChatbotConfigSrv.getBlockIdSubscribeAsset(),
      {
        ticker: asset.symbol,
      }
    ).addButton(
      "다른 찾기",
      ButtonAction.BLOCK,
      this.kakaoChatbotConfigSrv.getBlockIdInquireAsset(),
    ).buildComponent();

    const template = new SkillTemplateBuilder()
    .addComponent(component)
    .build();

    return new SkillResponseBuilder()
    .addTemplate(template)
    .addData({
      title,
      description,
      asset,
      isSubscribed,
    }).build();
  }

  /**
   * Deprecated
   */
  public alreadySubscribedAsset(
    ticker: Ticker
  ): SkillResponse {
    return this.singleSimpleText(
      this.textSrv.assetSubscribed(ticker),
      { ticker }
    );
  }

  public assetSubscribed(
    ticker: Ticker
  ): SkillResponse {
    return this.singleSimpleText(
      this.textSrv.assetSubscribed(ticker),
      { ticker }
    );
  }

  public assetUnsubscribed(
    ticker: Ticker
  ): SkillResponse {
    return this.singleSimpleText(
      this.textSrv.assetUnsubscribed(ticker),
      { ticker }
    );
  }

  /**
   * Deprecated
   */
  public notSubscribedAsset(
    ticker: Ticker
  ): SkillResponse {
    return this.singleSimpleText(
      this.textSrv.notSubscribedAsset(ticker),
      { ticker }
    );
  }

  public noSubscribedAsset(): SkillResponse {
    return this.singleSimpleText(this.textSrv.noSubscribedAsset());
  }

  public subscribedAssetInquiry(
    assets: FinancialAssetCore[]
  ): SkillResponse {
    if (assets.length === 0) { // 이미 앞에서 걸러서 진입 불가능, 그래도 확인.
      throw new Error("There are no assets");
    }

    const items
    = assets
    .slice(0, 10)
    .map(asset => {
      return new TextCardItemBuilder()
      .setTitle(asset.shortName || asset.longName || asset.symbol)
      .setDescription(joinLineBreak(
        asset.symbol,
        this.textSrv.getPriceStr(asset)
      ))
      .addButton(
        "구독 취소하기",
        ButtonAction.BLOCK,
        this.kakaoChatbotConfigSrv.getBlockIdCancelAssetSubscription(),
        {
          ticker: asset.symbol,
        }
      )
      .buildItem();
    });

    let template = new SkillTemplateBuilder()
    .addComponent(CarouselFactory.createComponent(
      ItemKey.TEXTCARD,
      items,
    ));

    const simpleTextAssets = assets.slice(10);
    if (0 < simpleTextAssets.length) {
      template = template.addComponent(
        SimpleTextFactory.createComponent(this.textSrv.subscribedAssetInquiry(simpleTextAssets))
      );
    }

    return new SkillResponseBuilder()
    .addTemplate(template.build())
    .build();
  }

  public tickerReported(): SkillResponse {
    return this.singleSimpleText(this.textSrv.reported());
  }

  private singleSimpleText(
    text: string,
    dataExtra?: Data
  ): SkillResponse {
    const template = new SkillTemplateBuilder()
    .addComponent(SimpleTextFactory.createComponent(text))
    .build();

    return new SkillResponseBuilder()
    .addTemplate(template)
    .addData({
      text,
      ...dataExtra,
    })
    .build();
  }

  public ss_showEventSerial(
    survey: StorebotSurvey
  ): SkillResponse {
    return new SkillResponseBuilder().addTemplate(
      new SkillTemplateBuilder()
      .addComponent(this.ss_cookieImage())
      .addComponent(SimpleTextFactory.createComponent(this.storebotSurveyText.eventSerial(survey)))
      .build()
    ).build();
  }

  private ss_enterComponent(): Component {
    return new TextCardBuilder()
    .setDescription(this.storebotSurveyText.enterDescription())
    .addButton(
      "설문하고 맛있는 쿠키 받기!",
      ButtonAction.BLOCK,
      this.kakaoChatbotConfigSrv.getBlockIdSurveyStart(),
    ).buildComponent();
  }

  public ss_noEventSerial(): SkillResponse {
    return new SkillResponseBuilder()
    .addTemplate(
      new SkillTemplateBuilder()
      .addComponent(this.ss_cookieImage())
      .addComponent(SimpleTextFactory.createComponent(this.storebotSurveyText.noEventSerial()))
      .addComponent(this.ss_enterComponent())
      .build()
    ).build();
  }

  public ss_alreadyDone(): SkillResponse {
    const component = new TextCardBuilder()
    .setDescription(this.storebotSurveyText.alreadyDone())
    .addButton(
      "설문 다시 하기",
      ButtonAction.BLOCK,
      this.kakaoChatbotConfigSrv.getBlockIdSurveyEnter(),
    )
    .addButton(
      "맛있는 쿠키 받기!",
      ButtonAction.BLOCK,
      this.kakaoChatbotConfigSrv.getBlockIdSurveyGetEventSerial(),
    )
    .buildComponent();

    const template = new SkillTemplateBuilder()
    .addComponent(component)
    .build();

    return new SkillResponseBuilder()
    .addTemplate(template)
    .build();
  }

  public ss_enter(): SkillResponse {
    return new SkillResponseBuilder()
    .addTemplate(
      new SkillTemplateBuilder()
      .addComponent(this.ss_enterComponent())
      .build()
    ).build();
  }

  /**
   * 서술형 질문은 구현하지 않았음. 에러를 던지고 있음.
   */
  public ss_question(
    question: Question,
    isContinued?: boolean,
  ): SkillResponse {
    if (isChoiceQuestion(question) === false) {
      throw new Error("Not supported question type");
    }

    // choices 뒤에 ! 필요없지만 jest 에서 null 이 아님을 이해하지 못해서 임시로 추가.
    // choices 가 3개 이상이면 어떻게 될까?
    const component = question.choices!.reduce(
      (pre, cur) => pre.addButton(
        cur,
        ButtonAction.BLOCK,
        this.kakaoChatbotConfigSrv.getBlockIdSurveyAnswer(),
        {
          questionId: question.id,
          value: cur,
        }
      ),
      new TextCardBuilder()
    )
    .setDescription(question.description)
    .buildComponent();

    let template = new SkillTemplateBuilder();

    if (isContinued) {
      template = template.addComponent(this.ss_continue());
    }

    return new SkillResponseBuilder()
    .addTemplate(template.addComponent(component).build())
    .build();
  }

  private ss_continue(): Component {
    return SimpleTextFactory.createComponent(this.storebotSurveyText.continue());
  }

  public ss_done(
    survey: StorebotSurvey
  ): SkillResponse {
    return new SkillResponseBuilder().addTemplate(
      new SkillTemplateBuilder()
      .addComponent(SimpleTextFactory.createComponent(this.storebotSurveyText.done()))
      .addComponent(this.ss_cookieImage())
      .addComponent(SimpleTextFactory.createComponent(this.storebotSurveyText.eventSerial(survey)))
      .build()
    ).build();
  }

  public ss_invalidAnswer(): SkillResponse {
    return new SkillResponseBuilder()
    .addTemplate(
      new SkillTemplateBuilder()
      .addComponent(SimpleTextFactory.createComponent(this.storebotSurveyText.invalidAnswer()))
      .addComponent(this.ss_enterComponent())
      .build()
    ).build();
  }

  private readonly COOKIE_IMAGE_URL = "https://storage.googleapis.com/odoldotol-image-store/storebot_taey_cookie_sample.jpg";

  private ss_cookieImage(): Component {
    return SimpleImageFactory.createComponent(
      this.COOKIE_IMAGE_URL,
      "쿠키 굽는중..."
    );
  }

}
