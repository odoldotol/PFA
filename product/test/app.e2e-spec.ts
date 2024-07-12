import { Test } from '@nestjs/testing';
import {
  HttpStatus,
  INestApplication,
  NotFoundException
} from '@nestjs/common';
import * as request from 'supertest';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT_TOKEN } from 'src/common/const/injectionToken.const';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app/app.module';
import { migrationRun } from 'src/../devMigrations/migration';
import {
  MigrationUpdatedAtTriggers
} from 'src/../devMigrations/postgres/updatedAtTriggers-Migration';
import { FinancialAssetService } from 'src/financialAsset';
import { MarketApiService } from 'src/marketApi/marketApi.service';
import { ConnectionService } from 'src/marketApi/connection.service';
import { KakaoChatbotGuard } from 'src/kakaoChatbot/guard/kakaoChatbot.guard';
import { SkillPayloadDto } from 'src/kakaoChatbot/dto';
import {
  URL_PREFIX as KAKAO_CHATBOT_URL_PREFIX,
  URL_API as KAKAO_CHATBOT_URL_API,
} from 'src/kakaoChatbot/const';
import {
  ApiName as KakaoChatbotApiName
} from 'src/kakaoChatbot/kakaoChatbot.controller';
import { SkillResponseService } from 'src/kakaoChatbot/skillResponse.service';
import {
  ExchangeIsoCode,
  Ticker
} from 'src/common/interface';
import {
  mockAppleTicker,
  mockNotExistsTicker
} from 'src/mock';
import {
  mockAssetsFromMarketMap,
  mockExchangesFromMarket,
  mockPriceTuplesFromMarketMap,
} from './mock';
import * as F from '@fxts/core';

describe('Product E2E', () => {
  let app: INestApplication;
  let redisClient: RedisClientType;
  let dataSource: DataSource;

  let marketApiService: MarketApiService;
  let financialAssetService: FinancialAssetService;

  let fetchFinancialAssetSpy: jest.SpyInstance;

  beforeAll(async () => {
    app = await createApp();
    redisClient = app.get(REDIS_CLIENT_TOKEN);
    dataSource = app.get(DataSource);

    marketApiService = app.get(MarketApiService);

    // Todo: SpDoc -> exchange
    jest.spyOn(marketApiService, 'fetchAllSpDoc')
    .mockResolvedValue(mockExchangesFromMarket);

    jest.spyOn(marketApiService, 'fetchPriceByISOcode')
    .mockImplementation(async (isoCode: ExchangeIsoCode) => {
      const result = mockPriceTuplesFromMarketMap.get(isoCode);
      if (result) {
        return result;
      } else {
        throw new Error('wrong isoCode');
      }
    });

    fetchFinancialAssetSpy = jest.spyOn(
      marketApiService,
      'fetchFinancialAsset'
    ).mockImplementation(async (ticker: Ticker) => {
      const result = mockAssetsFromMarketMap.get(ticker);
      if (result) {
        return result;
      } else {
        throw new NotFoundException({data:{ ticker }});
      }
    });
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('Application Initializing', () => {

    beforeAll(() => {
      financialAssetService = app.get(FinancialAssetService);
      const marketApiConnectionService = app.get(ConnectionService);

      jest.spyOn(marketApiConnectionService, 'onModuleInit')
      .mockReturnValue(Promise.resolve());
    });

    it("initialize", async () => {
      const initializedApp = await app.init();
      await migrationRun(MigrationUpdatedAtTriggers, dataSource);
      expect(initializedApp).toBeDefined();
    });

    it.todo('앱 초기화시 최신화 되지 않은 Market 의 선택적 업데이트');
  });

  describe(`Price 조회 로직. POST /financialasset/inquire/{ticker}`, () => {
  
    afterEach(() => {
      fetchFinancialAssetSpy.mockClear();
    });
  
    it('인메모리에 없는경우 => market api 로 가져와서 create', () => {
      return request(app.getHttpServer())
        .post(`/financialasset/inquire/${mockAppleTicker}`)
        .expect(HttpStatus.CREATED)
        .expect(res => {
          const body = res.body;
          expect(fetchFinancialAssetSpy).toBeCalledWith(mockAppleTicker);
          expect(fetchFinancialAssetSpy).toBeCalledTimes(1);
          expect(body).toEqual(mockAssetsFromMarketMap.get(mockAppleTicker));
        });
    });
  
    it('인메모리에 있고 최신인 경우 => 단순 조회', () => {
      return request(app.getHttpServer())
        .post(`/financialasset/inquire/${mockAppleTicker}`)
        .expect(HttpStatus.OK)
        .expect(res => {
          const body = res.body;
          expect(fetchFinancialAssetSpy).toBeCalledTimes(0);
          expect(body).toEqual(mockAssetsFromMarketMap.get(mockAppleTicker));
        });
    });
  
    it('인메모리에 있지만 최신 아닌 경우 => market api 로 가져와서 update', async () => {
      await (financialAssetService as any).financialAssetRepo.findOneAndUpdate(
        mockAppleTicker,
        {
          regularMarketLastClose: 1,
          regularMarketPreviousClose: 1,
          marketDate: '1990-03-25'
        }
      );
      return request(app.getHttpServer())
        .post(`/financialasset/inquire/${mockAppleTicker}`)
        .expect(HttpStatus.OK)
        .expect(res => {
          const body = res.body;
          expect(fetchFinancialAssetSpy).toBeCalledWith(mockAppleTicker);
          expect(fetchFinancialAssetSpy).toBeCalledTimes(1);
          expect(body).toEqual(mockAssetsFromMarketMap.get(mockAppleTicker));
        });
    });
  
    it.todo('결국 찾지 못함 => NotFound');
  });

  // TODO: 없는거 조회시 mongodb 에 추가되서 돌아오는 경우
  // 일단, 지금은 마켓에서 거래소 정기 업뎃 전파될때 거래소 데이터 생성 및 업뎃 되기떄문에 이에 대한 추가작업은 불필요하다.

  describe(`Market 서버에서 전파된 업데이트를 잘 반영하는가. POST /updater/price/{ISO_Code}`, () => {
    it.todo('Asset 의 업데이트, 삭제, 유지');
    it.todo('MarketDate 의 업데이트, 생성');
  });

  /* Todo:
  request.Test 객체란? return 이 필요. 재사용이 어려운 request.Test.
  하나의 요청은 하나의 테스트케이스가 되도록 테스트를 작성하는것이 기본.
  jest 와 supertest 가 express 에서 돌아가는 부분을 공부해보기.
  */

  describe('KakaoChatbot', () => {
    let skillResponseSrv: SkillResponseService;

    beforeAll(() => {
      skillResponseSrv = app.get(SkillResponseService);
    });

    describe('forbidden error: 200 OK, data has 403 exception', () => {
      for (let api in KAKAO_CHATBOT_URL_API) {
        it(api, () => {
          return request(app.getHttpServer())
          .post(KAKAO_CHATBOT_URL_PREFIX + KAKAO_CHATBOT_URL_API[api as KakaoChatbotApiName].path)
          .send(mockSkillPayload(mockBotUserKey1))
          .expect(HttpStatus.OK)
          .expect(({body}) => {
            expect(body.template).toEqual(unexpectedErrorTemplate());
            expect(body.data.exception.status).toBe(403);
          });
        });
      }

      afterAll(() => {
        // Disable Guard
        jest.spyOn(app.get(KakaoChatbotGuard), 'canActivate')
        .mockReturnValue(true);
      });
    });

    describe('KakaoChatbot skill has 5 seconds timeout: 200 OK, data has 408 exception', () => {
       // Todo: 5초씩 걸리면서 테스트하는건 별론데? 방법 찾기.
       it.todo('timeout error');
    });

    describe('unexpected error: 200 OK, data has an exception', () => {
      it.todo('unexpected error');
    });

    describe('bad request error: 200 OK, data has 400 exception', () => {
      it.todo('botUserKey');
    });

    describe(KAKAO_CHATBOT_URL_API.inquireAsset.path, () => {
      const url = KAKAO_CHATBOT_URL_PREFIX +
      KAKAO_CHATBOT_URL_API.inquireAsset.path;

      describe('bad request', () => {
        it('if ticker is not available: 200 OK, data has 400 exception', () => {
          return request(app.getHttpServer())
          .post(url)
          .send(mockSkillPayload(mockBotUserKey1))
          .expect(HttpStatus.OK)
          .expect(({body}) => {
            expect(body.template).toEqual(unexpectedErrorTemplate());
            expect(body.data.exception.status).toBe(400);
          });
        });

        it('Invalid Ticker: 200 OK, data has 400 exception', () => {
          return request(app.getHttpServer())
          .post(url)
          .send(F.pipe(
            mockSkillPayload(mockBotUserKey1),
            putTickerInParams('한글티커')
          ))
          .expect(HttpStatus.OK)
          .expect(({body}) => {
            expect(body.template)
            .toEqual(skillResponseSrv.invalidTickerError(null).template);
            expect(body.data.exception.status).toBe(400);
          });
        });
      });

      describe('not found', () => {
        it('could not find ticker: 200 OK, data has 404 exception as reason', () => {
          return request(app.getHttpServer())
          .post(url)
          .send(F.pipe(
            mockSkillPayload(mockBotUserKey1),
            putTickerInParams(mockNotExistsTicker)
          ))
          .expect(HttpStatus.OK)
          .expect(({body}) => {
            // template
            expect(body.data.reason.status).toBe(404);
          });
        });
      });

      it('found asset: 200 OK', () => {
        return request(app.getHttpServer())
        .post(url)
        .send(F.pipe(
          mockSkillPayload(mockBotUserKey1),
          putTickerInParams(mockAppleTicker)
        ))
        .expect(HttpStatus.OK)
        .expect(({body}) => {
          expect(body.template)
          .toEqual(skillResponseSrv.assetInquiry(
            mockAssetsFromMarketMap.get(mockAppleTicker)!,
            false
          ).template);
        });
      });
    });

    describe(KAKAO_CHATBOT_URL_API.addAssetSubscription.path, () => {
      const url = KAKAO_CHATBOT_URL_PREFIX +
      KAKAO_CHATBOT_URL_API.addAssetSubscription.path;

      it('bad request if ticker is not available: 200 OK, data has 400 exception', () => {
        return request(app.getHttpServer())
        .post(url)
        .send(mockSkillPayload(mockBotUserKey1))
        .expect(HttpStatus.OK)
        .expect(({body}) => {
          expect(body.template).toEqual(unexpectedErrorTemplate());
          expect(body.data.exception.status).toBe(400);
        });
      });

      // 서버를 통해 검증된 티커가 전달되기 때문에 잘못된 티커가 들어올 가능성은 없어야 하지만,
      it.todo('wrong ticker');

      it('AssetSubscription created: 201 CREATED', () => {
        return request(app.getHttpServer())
        .post(url)
        .send(F.pipe(
          mockSkillPayload(mockBotUserKey1),
          putTickerInClientExtra(mockAppleTicker)
        ))
        .expect(HttpStatus.CREATED)
        .expect(({body}) => {
          expect(body.template)
          .toEqual(skillResponseSrv.assetSubscribed(mockAppleTicker).template);
        });
      });

      it('even if already subscribed: 200 OK', () => {
        return request(app.getHttpServer())
        .post(url)
        .send(F.pipe(
          mockSkillPayload(mockBotUserKey1),
          putTickerInClientExtra(mockAppleTicker)
        ))
        .expect(HttpStatus.OK)
        .expect(({body}) => {
          expect(body.template)
          .toEqual(skillResponseSrv.assetSubscribed(mockAppleTicker).template);
        });
      });
    });

    describe(KAKAO_CHATBOT_URL_API.cancelAssetSubscription.path, () => {
      const url = KAKAO_CHATBOT_URL_PREFIX +
      KAKAO_CHATBOT_URL_API.cancelAssetSubscription.path;

      it('bad request if ticker is not available: 200 OK, data has 400 exception', () => {
        return request(app.getHttpServer())
        .post(url)
        .send(mockSkillPayload(mockBotUserKey1))
        .expect(HttpStatus.OK)
        .expect(({body}) => {
          expect(body.template).toEqual(unexpectedErrorTemplate());
          expect(body.data.exception.status).toBe(400);
        });
      });

      it('AssetSubscription deactivated: 200 OK', () => {
        return request(app.getHttpServer())
        .post(url)
        .send(F.pipe(
          mockSkillPayload(mockBotUserKey1),
          putTickerInClientExtra(mockAppleTicker)
        ))
        .expect(HttpStatus.OK)
        .expect(({body}) => {
          expect(body.template)
          .toEqual(skillResponseSrv.assetUnsubscribed(mockAppleTicker).template);
        });
      });

      it('even if not already subscribed: 200 OK', () => {
        return request(app.getHttpServer())
        .post(url)
        .send(F.pipe(
          mockSkillPayload(mockBotUserKey1),
          putTickerInClientExtra(mockAppleTicker)
        ))
        .expect(HttpStatus.OK)
        .expect(({body}) => {
          expect(body.template)
          .toEqual(skillResponseSrv.assetUnsubscribed(mockAppleTicker).template);
        });
      });
    });

    describe(KAKAO_CHATBOT_URL_API.inquireSubscribedAsset.path, () => {
      const url = KAKAO_CHATBOT_URL_PREFIX +
      KAKAO_CHATBOT_URL_API.inquireSubscribedAsset.path;

      it('200 OK', () => {
        return request(app.getHttpServer())
        .post(url)
        .send(mockSkillPayload(mockBotUserKey1))
        .expect(HttpStatus.OK);
        // todo
      });
    });

    describe(KAKAO_CHATBOT_URL_API.reportTicker.path, () => {
      const url = KAKAO_CHATBOT_URL_PREFIX +
      KAKAO_CHATBOT_URL_API.reportTicker.path;

      describe('bad request', () => {
        it('if ticker is not available: 200 OK, data has 400 exception', () => {
          return request(app.getHttpServer())
          .post(url)
          .send(mockSkillPayload(mockBotUserKey1))
          .expect(HttpStatus.OK)
          .expect(({body}) => {
            expect(body.template).toEqual(unexpectedErrorTemplate());
            expect(body.data.exception.status).toBe(400);
          });
        });

        it('if reason is not available: 200 OK, data has 400 exception', () => {
          return request(app.getHttpServer())
          .post(url)
          .send(F.pipe(
            mockSkillPayload(mockBotUserKey1),
            putTickerInClientExtra(mockAppleTicker)
          ))
          .expect(HttpStatus.OK)
          .expect(({body}) => {
            expect(body.template).toEqual(unexpectedErrorTemplate());
            expect(body.data.exception.status).toBe(400);
          });
        });
      });

      it('200 OK', () => {
        return request(app.getHttpServer())
        .post(url)
        .send(F.pipe(
          mockSkillPayload(mockBotUserKey1),
          putTickerInClientExtra(mockAppleTicker),
          putReasonInClientExtra({})
        ))
        .expect(HttpStatus.OK)
        .expect(({body}) => {
          expect(body.template)
          .toEqual(skillResponseSrv.tickerReported().template);
        });
      });
    });

    /* Todo: 시나리오 테스트
    inquireAsset 은 구독 상태에 따라 응답이 다름
    inquireSubscribedAsset 은 최근 구독한것을 맨 위에 보여줌
    */

    const mockSkillPayload = (
      botUserKey: string
    ): SkillPayloadDto => ({
      intent: {
        id: 'MOCK',
        name: 'MOCK',
      },
      userRequest: {
        timezone: 'Asia/Seoul',
        block: {
          id: 'MOCK',
          name: 'MOCK',
        },
        utterance: 'MOCK',
        lang: 'ko',
        user: {
          id: botUserKey,
          type: 'botUserKey',
          properties: {
            plusfriendUserKey: 'MOCK',
            appUserId: 'MOCK',
            isFriend: true,
            botUserKey,
          }
        },
      },
      bot: {
        id: 'MOCK',
        name: 'MOCK',
      },
      action: {
        id: 'MOCK',
        name: 'MOCK',
        params: {},
        detailParams: {},
        clientExtra: {}
      },
      contexts: [],
    });

    const putTickerInClientExtra = F.curry((
      ticker: string,
      data: SkillPayloadDto,
    ): SkillPayloadDto => {
      data.action.clientExtra['ticker'] = ticker;
      return data;
    });

    const putTickerInParams = F.curry((
      ticker: string,
      data: SkillPayloadDto,
    ): SkillPayloadDto => {
      data.action.params['ticker'] = ticker;
      return data;
    });

    const putReasonInClientExtra = F.curry((
      reason: any,
      data: SkillPayloadDto,
    ): SkillPayloadDto => {
      data.action.clientExtra['reason'] = reason;
      return data;
    });

    const unexpectedErrorTemplate = () =>
    skillResponseSrv.unexpectedError(null).template;

    const mockBotUserKey1 = 'MOCK_BOT_USER_KEY_1';
    // const mockBotUserKey2 = 'MOCK_BOT_USER_KEY_2';
  });

  afterAll(async () => {
    await redisClient.flushAll();
    await redisClient.disconnect();
    await dataSource.dropDatabase();
    await app.close();
  });

});

const createApp = async (): Promise<INestApplication> =>
(await moduleBuilder.compile()).createNestApplication();

const moduleBuilder = Test.createTestingModule({
  imports: [AppModule],
});