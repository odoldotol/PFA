import { readFileSync } from "fs";
import * as path from "path";
import {
  Injectable,
  Logger,
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
import OpenAI from "openai";
import { OpenAIConfigService } from "src/config";
import { ResponseRedisEntity } from "./redis.entity";
import { ModelResponse } from "./interface";

/**
 * @todo OpenAI 분리
 */
@Injectable()
export class YahooFinanceTickerService {

  private readonly logger = new Logger(YahooFinanceTickerService.name);

  private readonly openai = new OpenAI({
    apiKey: this.openaiConfigSrv.getApiKey(),
  });

  private readonly responseCreateParams = JSON.parse(readFileSync(
    path.resolve(__dirname, "..", "openai", "createParams/params.json"),
    "utf-8"
  ));

  private readonly runningFetchMap = new Map<InquireQuery, Promise<Ticker[]>>();

  constructor(
    private readonly openaiConfigSrv: OpenAIConfigService,
    @InjectRedisRepository(ResponseRedisEntity)
    private readonly responseRepo: RedisRepository<ModelResponse>,
  ) {}

  /**
   * 영어 또는 숫자만 가지는지   
   * 길이가 1~20 인지  
   * 특수문자는 . 한가지 총 한개만 가지거나 아예 안가짐, 뛰어쓰기 등도 가지지 않음  
   * . 뒤에는 2자리의 영어를 가짐  
   */
  public isStyle(
    query: InquireQuery
  ): boolean {;
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
    if (this.runningFetchMap.has(query)) {
      return this.runningFetchMap.get(query)!;
    }

    const modelResponsePm = this.fetchModelResponse(query);

    this.runningFetchMap.set(query, modelResponsePm.then(res => this.parseModelResponse(res, query)));

    this.responseRepo.createOne(query.toUpperCase(), await modelResponsePm)
    .catch(err => this.logger.error(err))
    .finally(() => this.runningFetchMap.delete(query));

    return this.runningFetchMap.get(query)!;
  }

  private async fetchModelResponse(
    query: InquireQuery
  ): Promise<ModelResponse> {
    const body = this.responseCreateParams.input.push({
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": query,
        }
      ]
    });

    return this.openai.responses.create(body)
    .then(res => JSON.parse(res.output_text))
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
          throw new Error("YahooFinanceTickerService: Exception 40");
        case 41:
          throw new Error("YahooFinanceTickerService: Exception 41");
        default:
          throw new Error("YahooFinanceTickerService: Unknown Exception");
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
