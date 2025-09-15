import { readFileSync } from "fs";
import {
  Injectable,
  NotFoundException
} from "@nestjs/common";
import {
  InquireQuery,
  Ticker
} from "src/common/interface";
import {
  InjectRedisRepository,
  RedisRepository
} from "src/database";
import { Loggable } from "src/logger";
import OpenAI from "openai";
import {
  BadIntentQueryException,
  TimeSensitiveQueryException
} from "src/kakaoChatbot/exception";
import {
  AppConfigService,
  // OpenAIConfigService
} from "src/config";
import { ResponseRedisEntity } from "./redis.entity";
import { ModelResponse } from "./interface";
import { getTraceId } from "src/openTelemetry";

/**
 * @todo OpenAI 분리 - 환경, OpenAI 구성, 모델응답바디 구성, 응답 생성.
 */
@Injectable()
export class YahooFinanceTickerService
  extends Loggable
{
  private readonly openai: OpenAI;
  private readonly responseCreateParamsJson: string;

  private readonly runningFetchMap = new Map<InquireQuery, Promise<Ticker[]>>();

  constructor(
    appConfigSrv: AppConfigService,
    // private readonly openaiConfigSrv: OpenAIConfigService,
    @InjectRedisRepository(ResponseRedisEntity)
    private readonly responseRepo: RedisRepository<ModelResponse>,
  ) {
    super();
    let openaiApiKey: string;
    let responseCreateParamsJson: string;

    try {
      openaiApiKey = readFileSync(
        "src/../openai.key",
        "utf-8"
      ).trim();

      responseCreateParamsJson = readFileSync(
        "src/../openai_create_params.json",
        "utf-8"
      );
    } catch (err) {
      if (appConfigSrv.isProduction()) {
        throw err;
      }

      openaiApiKey = "OPENAI_API_KEY";
      responseCreateParamsJson = readFileSync(
        "src/../openai_create_params.sample.json",
        "utf-8"
      );
    }

    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.responseCreateParamsJson = responseCreateParamsJson;
  }

  /**
   * 영어 또는 숫자만 가지는지   
   * 길이가 1~20 인지  
   * 특수문자는 . 한가지 총 한개만 가지거나 아예 안가짐, 뛰어쓰기 등도 가지지 않음  
   * . 뒤에는 2자리의 영어를 가짐  
   */
  public isStyle(
    query: InquireQuery
  ): boolean {
    return /^[a-zA-Z0-9]{1,20}(\.[a-zA-Z]{2})?$/.test(query);
  }

  public async inquire(
    query: InquireQuery,
  ): Promise<Ticker[]> {
    const tickerArr = await this.readCache(query);
    if (tickerArr == null) {
      return this.fetchFromModel(query);
    } else {
      return tickerArr;
    }
  }

  public async readCache(
    query: InquireQuery
  ): Promise<Ticker[] | null> {
    const cache = await this.responseRepo.findOne(query.toUpperCase());
    if (cache == null) {
      return null;
    }

    return this.parseModelResponse(cache.data, query);
  }

  /**
   * 배치, 캐싱
   */
  public async fetchFromModel(
    query: InquireQuery
  ): Promise<Ticker[]> {
    if (this.runningFetchMap.has(query) == false) {
      const modelResponsePm = this.fetchModelResponse(query);

      this.runningFetchMap.set(query, modelResponsePm.then(res => this.parseModelResponse(res, query)));

      modelResponsePm.then(
        res => this.responseRepo.createOne(query.toUpperCase(), res)
        .catch(err => this.logger.error(err)) //
        .finally(() => this.runningFetchMap.delete(query))
      ).catch(err => this.logger.error(err));
    }

    return this.runningFetchMap.get(query)!;
  }

  private async fetchModelResponse(
    query: InquireQuery
  ): Promise<ModelResponse> {
    const body // JSON.parse 로 매번 새 객체를 만듦.
    : OpenAI.Responses.ResponseCreateParamsNonStreaming
    = JSON.parse(this.responseCreateParamsJson);

    if (Array.isArray(body.input) == false) {
      throw new Error("Unexpected input type. Expected array");
    }

    (body.input as OpenAI.Responses.ResponseInput).push({ // 타입 단언 없으면 jest 가 타입 유추를 못함, 해결하고 타입단언 지우기.
      role: "user",
      content: [
        {
          type: "input_text",
          text: JSON.stringify({
            query
          })
        }
      ]
    });

    return this.openai.responses.create(body)
    .then(res => {
      // temp
      this.logger.verbose(`${getTraceId()} | ${res.id}`);

      return JSON.parse(res.output_text);
    })
    .then(this.validateModelResponse.bind(this));
  }

  /**
   * Exception, Notfound 처리 - throw
   */
  private parseModelResponse(
    modelResponse: ModelResponse,
    query: InquireQuery,
  ): Ticker[] {
    if (modelResponse.body == null) {
      switch (modelResponse.exceptionCode) {
        case 40:
          throw new BadIntentQueryException(query);
        case 41:
          throw new TimeSensitiveQueryException(query);
        default:
          throw new Error("Invalid ExceptionCode in ModelResponse.");
      }
    }

    const tickerArr = modelResponse.body.map(v => v.ticker);

    if (tickerArr.length == 0) {
      throw new NotFoundException({
        message: "Could not find any ticker from model response", 
        query,
      })
    }

    return tickerArr;
  }

  private validateModelResponse(
    modelResponse: ModelResponse,
  ): ModelResponse {
    const {
      body,
      exceptionCode,
    } = modelResponse;
 
    if (
      (Array.isArray(body) || body == null) &&
      (typeof exceptionCode == "number" || exceptionCode == null)
      &&
      (body == null || body.every(v =>
        typeof v.ticker == "string" && typeof v.confidence == "number"
      ))
      &&
      (exceptionCode == null || [40, 41].includes(exceptionCode))
    ) {
      return modelResponse;
    } else {
      throw new Error("Invalid Model Response");
    }
  }

}
