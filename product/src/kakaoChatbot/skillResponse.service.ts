import { Injectable } from "@nestjs/common";
import { KakaoChatbotConfigService } from "src/config";
import { TextService } from "./text.service";
import {
  BasicCardBuilder,
  ButtonAction,
  CardItem,
  CarouselFactory,
  Component,
  Data,
  ItemKey,
  ListCardBuilder,
  ListItemBuilder,
  SimpleTextFactory,
  SkillResponse,
  SkillResponseBuilder,
  SkillTemplateBuilder,
  TextCardBuilder,
  ThumbnailBuilder,
  ValidListCardBuilder,
  // ValidSkillTemplateBuilder,
} from "./skillResponse/v2";
import {
  FinancialAssetCore,
  Ticker
} from "src/common/interface";
import { StorebotSurvey } from "./storebot.survey.test/storebotSurvey.schema"; // type
import { StorebotSurveyText } from "./storebot.survey.test/storebotSurvey.text"; // 의존성 해결때 꼬이지 않게 인덱스에 접근하면 안됨
import { StorebotTextService } from "./storebot/text.service";
import {
  isChoiceQuestion,
  Question
} from "./storebot.survey.test/question.const";
import {
  getMoneyStr,
  joinBlank
} from "src/common/util";

@Injectable()
export class SkillResponseService {

  constructor(
    private readonly kakaoChatbotConfigSrv: KakaoChatbotConfigService,
    private readonly textSrv: TextService,
    private readonly storebotSurveyText: StorebotSurveyText,
    private readonly storebotTextSrv: StorebotTextService,
  ) {}

  public underMaintenance(): SkillResponse {
    return this.singleSimpleText(this.textSrv.underMaintenance1());
  }

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

  public notFriendError(
    exception: any,
    dataExtra?: Data
  ): SkillResponse {
    return this.singleSimpleText(this.textSrv.notFriendError(), {
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
    return new SkillResponseBuilder()
    .addTemplate(
      new SkillTemplateBuilder()
      .addComponent(
        new TextCardBuilder()
        .setDescription(this.textSrv.noSubscribedAsset())
        .addButton(
          "찾아보기",
          ButtonAction.BLOCK,
          this.kakaoChatbotConfigSrv.getBlockIdInquireAsset(),
        ).buildComponent()
      ).build()
    ).build();
  }

  /**
   * 스킬응답빌더들의 구현의 복잡성이 사용의 복잡성으로 이어지고있음...
   */
  public subscribedAssetInquiry(
    assets: FinancialAssetCore[],
    cursor: number = 0
  ): SkillResponse {
    if (assets.length === 0) { // 이미 앞에서 걸러서 진입 불가능, 그래도 확인.
      throw new Error("There are no assets");
    }

    const templateComponentCapacity = 3;
    const carouselComponentListCardItemCapacity = 5;
    const listCardItemCapacity = 4;

    const componentAssetCapacity
    = listCardItemCapacity
    * carouselComponentListCardItemCapacity;

    const templateAssetCapacity
    = templateComponentCapacity
    * carouselComponentListCardItemCapacity
    * listCardItemCapacity;

    const restAssets = assets.slice(templateAssetCapacity);

    /**
     * 1~4개 넣어요
     */
    const listCardItem = (
      listCardAssets: FinancialAssetCore[],
      start: number,
      end: number
    ) => {
      const listItemAssets = listCardAssets.slice(start, end);

      if (listItemAssets.length === 0) {
        throw new Error("There are no assets");
      }

      const realStart = 1 + (cursor * templateAssetCapacity) + start;
      const realEnd = realStart + listItemAssets.length - 1;

      return listItemAssets.reduce((builder, asset) => {
        const itemBuilder = new ListItemBuilder(joinBlank(
          asset.symbol,
          joinBlank(
            `(${this.textSrv.getChangeRateStr(asset)})`,
            getMoneyStr(asset.regularMarketLastClose, asset.currency),
          )
        ));

        const name = asset.shortName || asset.longName;
        if (name !== null) {
          itemBuilder.setDescription(name);
        }

        itemBuilder
        .setBlockAction(this.kakaoChatbotConfigSrv.getBlockIdInquireAssetNoInput())
        .addExtraData({
          ticker: asset.symbol
        });

        return builder.addItem(itemBuilder.build());
      }, new ListCardBuilder(`구독 중인 자산 (${realStart} ~ ${realEnd})`) as ValidListCardBuilder).buildItem()
    };

    /**
     * 1~20개 넣어요
     */
    const carouselComponent = (
      templateAssets: FinancialAssetCore[],
      componentStart: number,
      componentEnd: number
    ) => {
      const componentAssets = templateAssets.slice(componentStart, componentEnd);

      if (componentAssets.length === 0) {
        throw new Error("There are no assets");
      }

      const items: CardItem<ItemKey.LISTCARD>[] = [];

      let len = 1;
      let itemStart = 0;
      let itemEnd = listCardItemCapacity * len;

      do {
        items.push(listCardItem(componentAssets, itemStart, itemEnd));

        len += 1;
        itemStart = itemEnd;
        itemEnd = listCardItemCapacity * len;
      } while (
        itemStart < componentAssets.length &&
        len <= carouselComponentListCardItemCapacity
      );

      return CarouselFactory.createComponent(
        ItemKey.LISTCARD,
        items
      );
    };

    let start = 0;
    let end = start + componentAssetCapacity;

    const template = new SkillTemplateBuilder()
    .addComponent(carouselComponent(assets, start, end));

    start = end;
    end = start + componentAssetCapacity;

    if (start < assets.length) {
      template.addComponent(carouselComponent(assets, start, end));

      start = end;
      end = start + componentAssetCapacity;

      if (start < assets.length) {
        template.addComponent(carouselComponent(assets, start, end));
      }
    }

    if (0 < restAssets.length) {
      template.addQuickReply({ // 나머지 있을때만 추가해야함.
        label: "더보기",
        action: ButtonAction.BLOCK,
        blockId: this.kakaoChatbotConfigSrv.getBlockIdInquireSubscribedAsset(),
        extra: {
          assets: restAssets,
          cursor: cursor + 1
        }
      });
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

  public more(): SkillResponse {
    return new SkillResponseBuilder()
    .addTemplate(
      new SkillTemplateBuilder()
      .addComponent(
        new ListCardBuilder("More")
        .addItem(
          new ListItemBuilder("도움말")
          .setBlockAction(this.kakaoChatbotConfigSrv.getBlockIdHelp())
          .build()
        ).addItem(
          new ListItemBuilder("챗봇 소개")
          .setBlockAction(this.kakaoChatbotConfigSrv.getBlockIdIntroduce())
          .build()
        ).addItem(
          new ListItemBuilder("스폰서 문의")
          .setBlockAction(this.kakaoChatbotConfigSrv.getBlockIdSponsor())
          .build()
        ).buildComponent()
      ).build()
    ).build();
  }

  ////////////////////////// Storebot //////////////////////////

  public sb_welcomeAlarm(): SkillResponse {
    return new SkillResponseBuilder()
    .addTemplate(
      new SkillTemplateBuilder()
      .addComponent(
        new TextCardBuilder()
        .setTitle(this.storebotTextSrv.introduction())
        .setDescription(this.storebotTextSrv.introductionDetail())
        .addButton(
          "카톡 받기",
          ButtonAction.BLOCK,
          this.kakaoChatbotConfigSrv.getBlockIdScheduleLaunchAlarm(),
        ).buildComponent()
      ).build()
    ).build();
  }

  public sb_launchAlarmScheduled(): SkillResponse {
    return new SkillResponseBuilder()
    .addTemplate(
      new SkillTemplateBuilder()
      .addComponent(SimpleTextFactory.createComponent(this.storebotTextSrv.launchAlarmScheduled()))
      .build()
    ).build();
  }

  public sb_retryScheduleLaunchAlarmAfterAddFriend(): SkillResponse {
    return new SkillResponseBuilder()
    .addTemplate(
      new SkillTemplateBuilder()
      .addComponent(
        new TextCardBuilder()
        .setTitle(this.storebotTextSrv.needToAddFriend())
        .setDescription(this.storebotTextSrv.retryScheduleLaunchAlarmAfterAddFriend())
        .addButton(
          "카톡 받기",
          ButtonAction.BLOCK,
          this.kakaoChatbotConfigSrv.getBlockIdScheduleLaunchAlarm(),
        ).buildComponent()
      ).build()
    ).build();
  }

  ////////////////////////// Storebot Survey Test //////////////////////////

  private readonly COOKIE_IMAGE_URL = this.kakaoChatbotConfigSrv.getUrlTaeyCoffeeRoastersCookiesImage();

  public ss_showEventSerial(
    survey: StorebotSurvey,
    surveyVersion: number
  ): SkillResponse {
    return new SkillResponseBuilder().addTemplate(
      new SkillTemplateBuilder()
      .addComponent(this.ss_eventSerialComponent(this.getEventSerial(
        survey,
        surveyVersion
      )))
      .build()
    ).build();
  }

  private getEventSerial(
    survey: StorebotSurvey,
    surveyVersion: number
  ): string {
    return `${surveyVersion}-${survey.userId}`
  }

  private ss_eventSerialComponent(
    serial: string
  ): Component {
    return new BasicCardBuilder()
    .setThumbnail(new ThumbnailBuilder(this.COOKIE_IMAGE_URL).build())
    .setDescription(this.storebotSurveyText.eventSerial(serial))
    .buildComponent();
  }

  private ss_enterComponent(): Component {
    return SimpleTextFactory.createComponent(this.storebotSurveyText.enterDescription());
  }

  public ss_isNotFriend(): SkillResponse {
    return new SkillResponseBuilder()
    .addTemplate(
      new SkillTemplateBuilder()
      .addComponent(this.ss_isNotFriendComponent())
      .build()
    )
    .build();
  }

  public ss_isNotFriendComponent(): Component {
    return new TextCardBuilder()
    .setDescription(this.storebotSurveyText.isNotFriend())
    .addButton(
      "쿠키 받기",
      ButtonAction.BLOCK,
      this.kakaoChatbotConfigSrv.getBlockIdSurveyGetEventSerial(),
    )
    .buildComponent()
  }

  public ss_noEventSerial(
    question: Question,
    isContinued: boolean
  ): SkillResponse {
    let template = new SkillTemplateBuilder().addComponent(
      new BasicCardBuilder()
      .setThumbnail(new ThumbnailBuilder(this.COOKIE_IMAGE_URL).build())
      .setDescription(this.storebotSurveyText.noEventSerial())
      .buildComponent()
    );

    if (isContinued) {
      template = template.addComponent(this.ss_continue());
    } else {
      template = template.addComponent(this.ss_enterComponent());
    }
    template = template.addComponent(this.ss_questionComponent(question));

    return new SkillResponseBuilder()
    .addTemplate(template.build())
    .build();
  }

  public ss_alreadyDone(): SkillResponse {
    const component = new TextCardBuilder()
    .setDescription(this.storebotSurveyText.alreadyDone())
    .addButton(
      "설문 다시 하기",
      ButtonAction.BLOCK,
      this.kakaoChatbotConfigSrv.getBlockIdSurveyStart(),
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

  public ss_question(
    question: Question,
  ): SkillResponse {
    return new SkillResponseBuilder()
    .addTemplate(new SkillTemplateBuilder()
      .addComponent(this.ss_questionComponent(question))
      .build())
    .build();
  }

  /**
   * 서술형 질문은 구현하지 않았음. 에러를 던지고 있음.
   */
  public ss_start(
    question: Question,
    isContinued?: boolean,
  ): SkillResponse {
    let template = new SkillTemplateBuilder();
    if (isContinued) {
      template = template.addComponent(this.ss_continue());
    } else {
      template = template.addComponent(this.ss_enterComponent());
    }

    return new SkillResponseBuilder()
    .addTemplate(template
      .addComponent(this.ss_questionComponent(question))
      .build())
    .build();
  }

  private ss_questionComponent(
    question: Question,
  ): Component {
    if (isChoiceQuestion(question) === false) {
      throw new Error("Not supported question type");
    }

    let builder = new TextCardBuilder()
    .setDescription(question.description);

    if (question.title) {
      builder = builder.setTitle(question.title);
    }

    // choices 뒤에 ! 필요없지만 jest 에서 null 이 아님을 이해하지 못해서 임시로 추가.
    // choices 가 3개 이상이면 어떻게 될까?
    return question.choices!.reduce(
      (pre, cur) => pre.addButton(
        cur,
        ButtonAction.BLOCK,
        this.kakaoChatbotConfigSrv.getBlockIdSurveyAnswer(),
        {
          questionId: question.id,
          value: cur,
        }
      ),
      builder
    ).buildComponent();
  }

  private ss_continue(): Component {
    return SimpleTextFactory.createComponent(this.storebotSurveyText.continue());
  }

  public ss_done(
    survey: StorebotSurvey,
    surveyVersion: number,
    isFriend: boolean
  ): SkillResponse {
    const templateBuilder
    = new SkillTemplateBuilder()
    .addComponent(SimpleTextFactory.createComponent(this.storebotSurveyText.done()))

    if (isFriend) {
      templateBuilder.addComponent(this.ss_eventSerialComponent(this.getEventSerial(
        survey,
        surveyVersion
      )));
    } else {
      templateBuilder.addComponent(this.ss_isNotFriendComponent());
    }

    return new SkillResponseBuilder()
    .addTemplate(templateBuilder.build())
    .build();
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

}
