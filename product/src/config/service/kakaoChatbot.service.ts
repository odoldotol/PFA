import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  DEFAULT_KAKAO_CHATBOT_ID,
  DEFAULT_KAKAO_CHATBOT_BLOCK_ID_INQUIRE_ASSET,
  DEFAULT_KAKAO_CHATBOT_BLOCK_ID_REPORT,
  DEFAULT_KAKAO_CHATBOT_BLOCK_ID_SUBSCRIBE_ASSET,
  DEFAULT_KAKAO_CHATBOT_BLOCK_ID_CANCEL_ASSET_SUBSCRIPTION,
  DEFAULT_KAKAO_CHATBOT_ID_STOREBOT,
  DEFAULT_KAKAO_CHATBOT_BLOCK_ID_INQUIRE_SUBSCRIBED_ASSET,
  DEFAULT_KAKAO_CHATBOT_BLOCK_ID_INQUIRE_ASSET_NO_INPUT,
  DEFAULT_KAKAO_CHATBOT_BLOCK_ID_INQUIRE_ASSET_V2_NO_INPUT,
  DEFAULT_KAKAO_CHATBOT_BLOCK_ID_HELP,
  DEFAULT_KAKAO_CHATBOT_BLOCK_ID_INTRODUCE,
  DEFAULT_KAKAO_CHATBOT_BLOCK_ID_SPONSOR,
  DEFAULT_KAKAO_CHATBOT_ID_STOREBOT_ORDER,
} from "../const";
import { KakaoChatbotEnvKey } from "../enum";
import { KakaoChatbotEnvironmentVariables } from "../interface";
import { AppConfigService } from "./app.service";

@Injectable()
export class KakaoChatbotConfigService {

  private readonly ID: string;

  private readonly BLOCK_ID_INQUIRE_ASSET: string;
  private readonly BLOCK_ID_REPORT: string;
  private readonly BLOCK_ID_SUBSCRIBE_ASSET: string;
  private readonly BLOCK_ID_CANCEL_ASSET_SUBSCRIPTION: string;
  private readonly BLOCK_ID_INQUIRE_SUBSCRIBED_ASSET: string;
  private readonly BLOCK_ID_INQUIRE_ASSET_NO_INPUT: string;
  private readonly BLOCK_ID_INQUIRE_ASSET_V2_NO_INPUT: string;
  private readonly BLOCK_ID_HELP: string;
  private readonly BLOCK_ID_INTRODUCE: string;
  private readonly BLOCK_ID_SPONSOR: string

  private readonly ID_STOREBOT_ORDER: string;
  private readonly BLOCK_ID_SCHEDULE_LAUNCH_ALARM: string;

  // survey test
  private readonly ID_STOREBOT: string;
  private readonly BLOCK_ID_SURVEY_START: string;
  private readonly BLOCK_ID_SURVEY_ANSWER: string;
  private readonly BLOCK_ID_SURVEY_GET_EVENT_SERIAL: string;

  private readonly URL_TAEYCOFFEROASTERS_COOKIES_IMAGE: string;

  constructor(
    private readonly configSrv: ConfigService<KakaoChatbotEnvironmentVariables>,
    private readonly appConfigSrv: AppConfigService,
  ) {
    const id = this.readId();

    const blockIdInquireAsset = this.readBlockIdInquireAsset();
    const blockIdReport = this.readBlockIdReport();
    const blockIdSubscribeAsset = this.readBlockIdSubscribeAsset();
    const blockIdCancelAssetSubscription = this.readBlockIdCancelAssetSubscription();
    const blockIdInquireSubscribedAsset = this.readBlockIdInquireSubscribedAsset();
    const blockIdInquireAssetNoInput = this.readBlockIdInquireAssetNoInput();
    const blockIdInquireAssetV2NoInput = this.readBlockIdInquireAssetV2NoInput();
    const blockIdHelp = this.readBlockIdHelp();
    const blockIdIntroduce = this.readBlockIdIntroduce();
    const blockIdSponsor = this.readBlockIdSponsor();

    const id_storebot_order = this.readIdStorebotOrder();
    const blockIdScheduleLaunchAlarm = this.readBlockIdScheduleLaunchAlarm();

    // survey test
    const id_storebot = this.readIdStorebot();
    const blockIdSurveyStart = this.readBlockIdSurveyStart();
    const blockIdSurveyAnswer = this.readBlockIdSurveyAnswer();
    const blockIdSurveyGetEventSerial = this.readBlockIdSurveyGetEventSerial();

    const urlTaeyCoffeeRoastersCookiesImage = this.readUrlTaeyCoffeeRoastersCookiesImage();

    if (this.appConfigSrv.isProduction()) {
      if (
        id == undefined ||
        id_storebot == undefined ||
        id_storebot_order == undefined
      ) {
        throw new Error('KAKAO_CHATBOT_ID is not defined!');
      }
      
      if (
        blockIdInquireAsset == undefined ||
        blockIdReport == undefined ||
        blockIdSubscribeAsset == undefined ||
        blockIdCancelAssetSubscription == undefined ||
        blockIdInquireSubscribedAsset == undefined ||
        blockIdInquireAssetNoInput == undefined ||
        blockIdInquireAssetV2NoInput == undefined ||
        blockIdHelp == undefined ||
        blockIdIntroduce == undefined ||
        blockIdSponsor == undefined ||

        // survey test
        blockIdSurveyStart == undefined ||
        blockIdSurveyAnswer == undefined ||
        blockIdSurveyGetEventSerial == undefined ||
        urlTaeyCoffeeRoastersCookiesImage == undefined
      ) {
        throw new Error('KakaoChatbot block ids are not defined!');
      }
    }

    this.ID = id ?? DEFAULT_KAKAO_CHATBOT_ID;

    this.BLOCK_ID_INQUIRE_ASSET = blockIdInquireAsset ?? DEFAULT_KAKAO_CHATBOT_BLOCK_ID_INQUIRE_ASSET;
    this.BLOCK_ID_REPORT = blockIdReport ?? DEFAULT_KAKAO_CHATBOT_BLOCK_ID_REPORT;
    this.BLOCK_ID_SUBSCRIBE_ASSET = blockIdSubscribeAsset ?? DEFAULT_KAKAO_CHATBOT_BLOCK_ID_SUBSCRIBE_ASSET;
    this.BLOCK_ID_CANCEL_ASSET_SUBSCRIPTION = blockIdCancelAssetSubscription ?? DEFAULT_KAKAO_CHATBOT_BLOCK_ID_CANCEL_ASSET_SUBSCRIPTION;
    this.BLOCK_ID_INQUIRE_SUBSCRIBED_ASSET = blockIdInquireSubscribedAsset ?? DEFAULT_KAKAO_CHATBOT_BLOCK_ID_INQUIRE_SUBSCRIBED_ASSET;
    this.BLOCK_ID_INQUIRE_ASSET_NO_INPUT = blockIdInquireAssetNoInput ?? DEFAULT_KAKAO_CHATBOT_BLOCK_ID_INQUIRE_ASSET_NO_INPUT;
    this.BLOCK_ID_INQUIRE_ASSET_V2_NO_INPUT = blockIdInquireAssetV2NoInput ?? DEFAULT_KAKAO_CHATBOT_BLOCK_ID_INQUIRE_ASSET_V2_NO_INPUT;
    this.BLOCK_ID_HELP = blockIdHelp ?? DEFAULT_KAKAO_CHATBOT_BLOCK_ID_HELP;
    this.BLOCK_ID_INTRODUCE = blockIdIntroduce ?? DEFAULT_KAKAO_CHATBOT_BLOCK_ID_INTRODUCE;
    this.BLOCK_ID_SPONSOR = blockIdSponsor ?? DEFAULT_KAKAO_CHATBOT_BLOCK_ID_SPONSOR;

    this.ID_STOREBOT_ORDER = id_storebot_order ?? DEFAULT_KAKAO_CHATBOT_ID_STOREBOT_ORDER;
    this.BLOCK_ID_SCHEDULE_LAUNCH_ALARM = blockIdScheduleLaunchAlarm ?? '';

    // survey test
    this.ID_STOREBOT = id_storebot ?? DEFAULT_KAKAO_CHATBOT_ID_STOREBOT;
    this.BLOCK_ID_SURVEY_START = blockIdSurveyStart ?? '';
    this.BLOCK_ID_SURVEY_ANSWER = blockIdSurveyAnswer ?? '';
    this.BLOCK_ID_SURVEY_GET_EVENT_SERIAL = blockIdSurveyGetEventSerial ?? '';
    this.URL_TAEYCOFFEROASTERS_COOKIES_IMAGE = urlTaeyCoffeeRoastersCookiesImage ?? '';
  }

  public getId(): string {
    return this.ID;
  }

  public getBlockIdInquireAsset(): string {
    return this.BLOCK_ID_INQUIRE_ASSET;
  }

  public getBlockIdReport(): string {
    return this.BLOCK_ID_REPORT;
  }

  public getBlockIdSubscribeAsset(): string {
    return this.BLOCK_ID_SUBSCRIBE_ASSET;
  }

  public getBlockIdCancelAssetSubscription(): string {
    return this.BLOCK_ID_CANCEL_ASSET_SUBSCRIPTION;
  }

  public getBlockIdInquireSubscribedAsset(): string {
    return this.BLOCK_ID_INQUIRE_SUBSCRIBED_ASSET;
  }

  public getBlockIdInquireAssetNoInput(): string {
    return this.BLOCK_ID_INQUIRE_ASSET_NO_INPUT;
  }

  public getBlockIdInquireAssetV2NoInput(): string {
    return this.BLOCK_ID_INQUIRE_ASSET_V2_NO_INPUT;
  }

  public getBlockIdHelp(): string {
    return this.BLOCK_ID_HELP;
  }

  public getBlockIdIntroduce(): string {
    return this.BLOCK_ID_INTRODUCE;
  }

  public getBlockIdSponsor(): string {
    return this.BLOCK_ID_SPONSOR;
  }

  private readId(): string | undefined {
    return this.configSrv.get(
      KakaoChatbotEnvKey.ID,
      { infer: true }
    );
  }

  private readBlockIdInquireAsset(): string | undefined {
    return this.configSrv.get(
      KakaoChatbotEnvKey.BLOCK_ID_INQUIRE_ASSET,
      { infer: true }
    );
  }

  private readBlockIdReport(): string | undefined {
    return this.configSrv.get(
      KakaoChatbotEnvKey.BLOCK_ID_REPORT,
      { infer: true }
    );
  }

  private readBlockIdSubscribeAsset(): string | undefined {
    return this.configSrv.get(
      KakaoChatbotEnvKey.BLOCK_ID_SUBSCRIBE_ASSET,
      { infer: true }
    );
  }

  private readBlockIdCancelAssetSubscription(): string | undefined {
    return this.configSrv.get(
      KakaoChatbotEnvKey.BLOCK_ID_CANCEL_ASSET_SUBSCRIPTION,
      { infer: true }
    );
  }

  private readBlockIdInquireSubscribedAsset(): string | undefined {
    return this.configSrv.get(
      KakaoChatbotEnvKey.BLOCK_ID_INQUIRE_SUBSCRIBED_ASSET,
      { infer: true }
    );
  }

  private readBlockIdInquireAssetNoInput(): string | undefined {
    return this.configSrv.get(
      KakaoChatbotEnvKey.BLOCK_ID_INQUIRE_ASSET_NO_INPUT,
      { infer: true }
    );
  }

  private readBlockIdInquireAssetV2NoInput(): string | undefined {
    return this.configSrv.get(
      KakaoChatbotEnvKey.BLOCK_ID_INQUIRE_ASSET_V2_NO_INPUT,
      { infer: true }
    );
  }

  private readBlockIdHelp(): string | undefined {
    return this.configSrv.get(
      KakaoChatbotEnvKey.BLOCK_ID_HELP,
      { infer: true }
    );
  }

  private readBlockIdIntroduce(): string | undefined {
    return this.configSrv.get(
      KakaoChatbotEnvKey.BLOCK_ID_INTRODUCE,
      { infer: true }
    );
  }

  private readBlockIdSponsor(): string | undefined {
    return this.configSrv.get(
      KakaoChatbotEnvKey.BLOCK_ID_SPONSOR,
      { infer: true }
    );
  }

  public getIdStorebotFam(): string[] {
    return [
      this.ID_STOREBOT,
      this.ID_STOREBOT_ORDER,
    ];
  }

  public getBlockIdScheduleLaunchAlarm(): string {
    return this.BLOCK_ID_SCHEDULE_LAUNCH_ALARM;
  }

  /*
   * survey test
   */

  public getIdStorebot(): string {
    return this.ID_STOREBOT;
  }

  public getBlockIdSurveyStart(): string {
    return this.BLOCK_ID_SURVEY_START;
  }

  public getBlockIdSurveyAnswer(): string {
    return this.BLOCK_ID_SURVEY_ANSWER;
  }

  public getBlockIdSurveyGetEventSerial(): string {
    return this.BLOCK_ID_SURVEY_GET_EVENT_SERIAL;
  }

  public getUrlTaeyCoffeeRoastersCookiesImage(): string {
    return this.URL_TAEYCOFFEROASTERS_COOKIES_IMAGE;
  }

  private readIdStorebotOrder(): string | undefined {
    return this.configSrv.get(
      KakaoChatbotEnvKey.ID_STOREBOT_ORDER,
      { infer: true }
    );
  }

  private readBlockIdScheduleLaunchAlarm(): string | undefined {
    return this.configSrv.get(
      KakaoChatbotEnvKey.BLOCK_ID_SCHEDULE_LAUNCH_ALARM,
      { infer: true }
    );
  }

  private readIdStorebot(): string | undefined {
    return this.configSrv.get(
      KakaoChatbotEnvKey.ID_STOREBOT,
      { infer: true }
    );
  }

  private readBlockIdSurveyStart(): string | undefined {
    return this.configSrv.get(
      KakaoChatbotEnvKey.BLOCK_ID_SURVEY_START,
      { infer: true }
    );
  }

  private readBlockIdSurveyAnswer(): string | undefined {
    return this.configSrv.get(
      KakaoChatbotEnvKey.BLOCK_ID_SURVEY_ANSWER,
      { infer: true }
    );
  }

  private readBlockIdSurveyGetEventSerial(): string | undefined {
    return this.configSrv.get(
      KakaoChatbotEnvKey.BLOCK_ID_SURVEY_GET_EVENT_SERIAL,
      { infer: true }
    );
  }

  private readUrlTaeyCoffeeRoastersCookiesImage(): string | undefined {
    return this.configSrv.get(
      KakaoChatbotEnvKey.URL_TAEYCOFFEROASTERS_COOKIES_IMAGE,
      { infer: true }
    );
  }

}
