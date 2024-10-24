import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  DEFAULT_KAKAO_CHATBOT_ID,
  DEFAULT_KAKAO_CHATBOT_BLOCK_ID_INQUIRE_ASSET,
  DEFAULT_KAKAO_CHATBOT_BLOCK_ID_REPORT,
  DEFAULT_KAKAO_CHATBOT_BLOCK_ID_SUBSCRIBE_ASSET,
  DEFAULT_KAKAO_CHATBOT_BLOCK_ID_CANCEL_ASSET_SUBSCRIPTION,
  DEFAULT_KAKAO_CHATBOT_ID_STOREBOT,
  DEFAULT_KAKAO_CHATBOT_BLOCK_ID_INQUIRE_SUBSCRIBED_ASSET
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

  // survey test
  private readonly ID_STOREBOT: string;
  private readonly BLOCK_ID_SURVEY_START: string;
  private readonly BLOCK_ID_SURVEY_ANSWER: string;
  private readonly BLOCK_ID_SURVEY_GET_EVENT_SERIAL: string;

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

    // survey test
    const id_storebot = this.readIdStorebot();
    const blockIdSurveyStart = this.readBlockIdSurveyStart();
    const blockIdSurveyAnswer = this.readBlockIdSurveyAnswer();
    const blockIdSurveyGetEventSerial = this.readBlockIdSurveyGetEventSerial();

    if (this.appConfigSrv.isProduction()) {
      if (id === undefined) {
        throw new Error('KAKAO_CHATBOT_ID is not defined!');
      } else if (
        blockIdInquireAsset === undefined ||
        blockIdReport === undefined ||
        blockIdSubscribeAsset === undefined ||
        blockIdCancelAssetSubscription === undefined ||
        blockIdInquireSubscribedAsset === undefined ||

        // survey test
        blockIdSurveyStart === undefined ||
        blockIdSurveyAnswer === undefined ||
        blockIdSurveyGetEventSerial === undefined
      ) {
        throw new Error('KakaoChatbot block ids are not defined!');
      }
    }

    this.ID = id || DEFAULT_KAKAO_CHATBOT_ID;

    this.BLOCK_ID_INQUIRE_ASSET = blockIdInquireAsset ||
      DEFAULT_KAKAO_CHATBOT_BLOCK_ID_INQUIRE_ASSET;
    this.BLOCK_ID_REPORT = blockIdReport ||
      DEFAULT_KAKAO_CHATBOT_BLOCK_ID_REPORT;
    this.BLOCK_ID_SUBSCRIBE_ASSET = blockIdSubscribeAsset ||
      DEFAULT_KAKAO_CHATBOT_BLOCK_ID_SUBSCRIBE_ASSET;
    this.BLOCK_ID_CANCEL_ASSET_SUBSCRIPTION = blockIdCancelAssetSubscription ||
      DEFAULT_KAKAO_CHATBOT_BLOCK_ID_CANCEL_ASSET_SUBSCRIPTION;
    this.BLOCK_ID_INQUIRE_SUBSCRIBED_ASSET = blockIdInquireSubscribedAsset ||
      DEFAULT_KAKAO_CHATBOT_BLOCK_ID_INQUIRE_SUBSCRIBED_ASSET;

    // survey test
    this.ID_STOREBOT = id_storebot || DEFAULT_KAKAO_CHATBOT_ID_STOREBOT;
    this.BLOCK_ID_SURVEY_START = blockIdSurveyStart || '';
    this.BLOCK_ID_SURVEY_ANSWER = blockIdSurveyAnswer || '';
    this.BLOCK_ID_SURVEY_GET_EVENT_SERIAL = blockIdSurveyGetEventSerial || '';
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

}
