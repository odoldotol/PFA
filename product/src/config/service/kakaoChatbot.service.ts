import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  DEFAULT_KAKAO_CHATBOT_ID,
  DEFAULT_KAKAO_CHATBOT_BLOCK_ID_INQUIRE_ASSET,
  DEFAULT_KAKAO_CHATBOT_BLOCK_ID_REPORT,
  DEFAULT_KAKAO_CHATBOT_BLOCK_ID_SUBSCRIBE_ASSET,
  DEFAULT_KAKAO_CHATBOT_BLOCK_ID_CANCEL_ASSET_SUBSCRIPTION
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

  constructor(
    private readonly configSrv: ConfigService<KakaoChatbotEnvironmentVariables>,
    private readonly appConfigSrv: AppConfigService,
  ) {
    const id = this.readId();

    const blockIdInquireAsset = this.readBlockIdInquireAsset();
    const blockIdReport = this.readBlockIdReport();
    const blockIdSubscribeAsset = this.readBlockIdSubscribeAsset();
    const blockIdCancelAssetSubscription = this.readBlockIdCancelAssetSubscription();

    if (this.appConfigSrv.isProduction()) {
      if (id === undefined) {
        throw new Error('KAKAO_CHATBOT_ID is not defined!');
      } else if (
        blockIdInquireAsset === undefined ||
        blockIdReport === undefined ||
        blockIdSubscribeAsset === undefined ||
        blockIdCancelAssetSubscription === undefined
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
}
