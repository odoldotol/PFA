import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OpenAIEnvKey } from "../enum";
import { OpenAIEnvironmentVariables } from "../interface";
import { DEFAULT_OPENAI_API_KEY } from "../const";

@Injectable()
export class OpenAIConfigService {

  constructor(
    private readonly configSrv: ConfigService<OpenAIEnvironmentVariables>,
  ) {}

  public getApiKey(): string {
    return this.configSrv.get(
      OpenAIEnvKey.API_KEY,
      DEFAULT_OPENAI_API_KEY,
      { infer: true }
    );
  }

}
