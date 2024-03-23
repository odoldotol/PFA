import { ConfigModule as NestConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "src/config/config.module";
import { ExchangeEntity } from "../exchange/exchange.entity";
import { FinancialAssetEntity } from "../financialAsset/financialAsset.entity";
import {
  AppConfigService,
  PostgresConfigService
} from "src/config";
import { Database_ExchangeService } from "../exchange/exchange.service";
import { Database_FinancialAssetService } from "../financialAsset/financialAsset.service";
import { TypeOrmOptionsService } from "../postgres/typeormOptions.service";
import { DataSource } from "typeorm";
import { FinancialAsset } from "src/common/class/financialAsset";
import options from "src/config/const/moduleOptions.const";
import { 
  mockKoreaExchange,
  mockNewYorkStockExchange,
  mockApple,
  mockSamsungElec,
  mockUsaTreasuryYield10y
} from "src/mock";

jest.setTimeout(10000);

/* TypeOrmModule 에러
Jest 병열 + synchronize: true 가 문제를 일으키는것?

=>
해결: postgresql 에 연결하는 각각의 두 테스트모듈을 합침.
결론: 유닛 테스트는 유닛 테스트 답게 완벽하게 독힙적이어야 한다.

...
Jest 는 모든 각각의 테스트들을 확실히 독립적이고 동기적으로 실행함.
하지만 테스트 외의 작업들은 성능을 위해 병열실행이 가능하면 병열로 처리하려고 함.
특히, 서로 다른 spec 파일의 경우는 완전 독립적인 테스트모듈로 가정(옳은 방향)하기에 더더욱 적극적으로 병열처리 함.
(이 말이 무슨 말인지는 아래 더 자세히)

...
나의 경우, 각각의 다른 테스트 spec 파일에서 같은 방식으로, 동일한 Postgresql 에 연결하기 때문에
(전체 테스트를 완료하는데에는 문제가 없었지만)
테스트가 교차하는 시점부근에서 duplicate key 에러나 table 문제 등으로 재연결 시도가 한번정도 일어나는 것.
(사실, 근본적으로 각각의 테스트 모듈이 서로 독립적이지 못한 것이 전혀 유닛테스트스럽지 못함)

...
더 디테일하게 들여다 보면,
여기에서 문제가 되던 부분은 분명하게 Postgresql 의 연결과 파괴작업임.
편의상 연결을 A, 파괴를 B 라고 하면,

하나의 spec 파일(테스트 모듈)내에서 각 테스트 케이스 사이에 필요한 A 와 B 는,
*Each, *All 등을 이용해 절차를 완전히 컨트롤 할 수 있음.

그러나!, 앞에 놓인 spec 파일(테스트 모듈)에서 마지막 테스트 케이스가 완료된 후 남은 비동기 작업들을 X 라고 하고,
다음 spec 파일(테스트 모듈)의 첫번째 테스트 케이스 이전의 비동기 작업들과 첫번째 테스트 내부의 비동기 작업들을 Y 라고 하면,
X 와 Y 는 병열 상태에 놓여질 수 있음.

...
Jest 는 기본적으로 다른 spec 파일(테스트모듈)사이에서의 작업을 동기적으로 컨트롤 하지 않고 그럴 이유도, 인터페이스도 없음.
그러니, 앞서 말했듯이 다른 spec 파일(테스트모듈)이 서로 독립적이지 못하다는 것은 완전한 오용임.
그리고 이는 Jest 의 성능을 향상시키기에 확실히 옳은 방향임.

Jest 의 옳바른 사용과 유닛 테스트는, 당연하게도,
각각의 spec(테스트 모듈)을 완전히 독립적이게 하고,
각각의 테스트 케이스 또한 동기적인 관점에서 완전히 독립적으로 두는 것임 */

/* 특이한 시도 메모.
1. 테스트 케이스 내부에서 프로미스의 리졸브를 setTimeOut 콜백에서 실행하고 프로미스를 기다리기.
이런식으로 분명 위의 문제를 해결할 수 있었음. (첫 테스트의 계산을 1000ms 지연)
하지만, setTimeout 은 Jest 를 벗어나 테스트에 근본적인 문제를 만들 수 있는놈임을 발견함.

극단적인 예로, setTimeOut 콜백 내부에서 진행되는 테스트를 resolve 이후에 평가하도록 하면,
만약 그 평가가 실패한다면,
Jest 는 다음 테스트(평가 당시에 진행중이던 테스트)가 실패했다고 착각해버림.

2. spec 파일을 모듈로 만들고 다른 spec 파일에서 import 하기.
Jest 는 스스로 테스트 그라운드(컨텍스트?)를 구성하고, 모든 spec 파일을 읽어서,
테스트들 + 테스트들와 동기적으로 얽힌 작업들 을 제외한 작업들을 처리하고,
모든 실행할 테스트들을 순서대로 나열하고,
테스트를 시작함.

때문에 모듈로 import 된 spec 파일은 Jest 가 두번 읽게될것임.
테스트도 두번 진행될 것이고 내가 원하는 동작도 얻을 수 없을것임. */

describe('ExchangeService', () => {
  let exchangeSrv: Database_ExchangeService;
  let dataSource: DataSource;

  beforeEach(async () => {
    ({ exchangeSrv, dataSource } = await getTestingInstances());
  });

  afterEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
  });

  it('should be defined', async () => {
    expect(exchangeSrv).toBeDefined();
  });

  describe('createOne', () => {
    it('should create a record in exchanges table', async () => {
      await exchangeSrv.createOne(mockKoreaExchange);
      const result = await dataSource.query('SELECT * FROM exchanges');
      expect(result[0]).toEqual({
        iso_code: mockKoreaExchange.isoCode,
        iso_timezonename: mockKoreaExchange.isoTimezoneName,
        market_date: mockKoreaExchange.marketDate,
      });
    });

    it('should return the created record', async () => {
      const result = await exchangeSrv.createOne(mockKoreaExchange);
      expect(result).toEqual(mockKoreaExchange);
    });
  });

  describe('exist', () => {
    it('should return boolean if exist or not', async () => {
      expect(await exchangeSrv.exist({ iso_code: mockKoreaExchange.isoCode }))
      .toBe(false);
      await exchangeSrv.createOne(mockKoreaExchange);
      expect(await exchangeSrv.exist({ iso_code: mockKoreaExchange.isoCode }))
      .toBe(true);
    });
  });

  describe('readAll', () => {
    it('should return all records in exchanges table', async () => {
      await exchangeSrv.createOne(mockKoreaExchange);
      await exchangeSrv.createOne(mockNewYorkStockExchange);
      const result = await exchangeSrv.readAll();
      expect(result).toEqual([mockKoreaExchange, mockNewYorkStockExchange]);
    });
  });

  describe('readOneByPk', () => {
    it('should return a record by primary key', async () => {
      await exchangeSrv.createOne(mockKoreaExchange);
      await exchangeSrv.createOne(mockNewYorkStockExchange);
      const result = await exchangeSrv.readOneByPk(mockKoreaExchange.isoCode);
      expect(result).toEqual(mockKoreaExchange);
    });
  });

  describe('updateMarketDateByPk', () => {
    it('should update marketDate of a record found by primary key', async () => {
      await exchangeSrv.createOne(mockKoreaExchange);
      const marketDate = '2023-07-04';
      await exchangeSrv.updateMarketDateByPk(mockKoreaExchange.isoCode, marketDate);
      const result = await exchangeSrv.readOneByPk(mockKoreaExchange.isoCode);
      expect(result).toEqual(Object.assign(
        mockKoreaExchange,
        {
          market_date: marketDate,
          marketDate: marketDate
        }
      ));
    });
  });
});

describe('FinancialAssetsService', () => {
  let exchangeSrv: Database_ExchangeService;
  let financialAssetSrv: Database_FinancialAssetService;
  let dataSource: DataSource;

  beforeEach(async () => {
    ({ exchangeSrv, financialAssetSrv, dataSource } = await getTestingInstances());
    await exchangeSrv.createOne(mockKoreaExchange);
    await exchangeSrv.createOne(mockNewYorkStockExchange);
  });

  afterEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
  });

  it('should be defined', async () => {
    expect(financialAssetSrv).toBeDefined();
  });

  describe('createMany', () => {
    it('should create records in financial_assets table', async () => {
      const values = [mockApple, mockSamsungElec, mockUsaTreasuryYield10y];
      const result = await financialAssetSrv.createMany(values);
      const queryResult = await dataSource.query('SELECT * FROM financial_assets');
      expect(result).toEqual(values);
      expect(queryResult.length).toBe(3);
    });

    it('should create if nullable property is undefined', async () => {
      const values: FinancialAsset[] = [{
        symbol: mockApple.symbol,
        quoteType: mockApple.quoteType,
        quote_type: mockApple.quoteType,
        shortName: mockApple.shortName,
        short_name: mockApple.shortName,
        longName: null,
        long_name: null,
        exchange: null,
        currency: mockApple.currency,
        regularMarketLastClose: mockApple.regularMarketLastClose,
        regular_market_last_close: mockApple.regularMarketLastClose
      }];
      const result = await financialAssetSrv.createMany(values);
      const queryResult = await dataSource.query('SELECT * FROM financial_assets');
      expect(result).toEqual(values);
      expect(queryResult[0]).toEqual({
        symbol: mockApple.symbol,
        quote_type: mockApple.quoteType,
        short_name: mockApple.shortName,
        long_name: null,
        exchange: null,
        currency: mockApple.currency,
        regular_market_last_close: mockApple.regularMarketLastClose
      });
    });

    it('should return empty Array if values is empty', async () => {
      const result = await financialAssetSrv.createMany([]);
      expect(result).toEqual([]);
    });
  });

  describe('existByPk', () => {
    it('should return boolean if exist or not by primary key', async () => {
      expect(await financialAssetSrv.existByPk(mockApple.symbol)).toBe(false);
      await financialAssetSrv.createMany([mockApple]);
      expect(await financialAssetSrv.existByPk(mockApple.symbol)).toBe(true);
    });
  });

  describe('readOneByPk', () => {
    it('should return a record by primary key', async () => {
      await financialAssetSrv.createMany([
        mockApple,
        mockSamsungElec,
        mockUsaTreasuryYield10y
      ]);
      const result = await financialAssetSrv.readOneByPk(mockSamsungElec.symbol);
      expect(result).toEqual(mockSamsungElec);
    });

    it('should return null if not exist', async () => {
      const result = await financialAssetSrv.readOneByPk(mockSamsungElec.symbol);
      expect(result).toBe(null);
    });
  });

  describe('readSymbolsByExchange', () => {
    it('should return Array of symbol by exchange', async () => {
      await financialAssetSrv.createMany([
        mockApple,
        mockSamsungElec,
        mockUsaTreasuryYield10y
      ]);
      const result = await financialAssetSrv.readSymbolsByExchange(mockApple.exchange);
      expect(result).toEqual([mockApple.symbol, mockUsaTreasuryYield10y.symbol]);
    });

    it.todo('exchange 가 null 인 경우');
  });

  describe('readManyByExchange', () => {
    it('should return records by exchange', async () => {
      await financialAssetSrv.createMany([
        mockApple,
        mockSamsungElec,
        mockUsaTreasuryYield10y
      ]);
      const result = await financialAssetSrv.readManyByExchange(mockApple.exchange);
      expect(result).toEqual([mockApple, mockUsaTreasuryYield10y]);
    });

    it.todo('exchange 가 null 인 경우');
  });

  describe('updatePriceMany', () => {
    it('should update regularMarketLastClose', async () => {
      await financialAssetSrv.createMany([
        mockApple,
        mockSamsungElec,
        mockUsaTreasuryYield10y
      ]);
      await financialAssetSrv.updatePriceMany([
        {
          symbol: mockApple.symbol,
          regularMarketLastClose: 777
        },
        {
          symbol: mockSamsungElec.symbol,
          regularMarketLastClose: 77777
        },
      ]);
      const result = await dataSource.query<FinancialAssetEntity[]>(`
        SELECT * FROM financial_assets
      `).then(res => res.map(entity => new FinancialAsset(entity)));
      expect(result).toEqual([
        mockUsaTreasuryYield10y,
        {
          ...mockApple,
          regularMarketLastClose: 777,
          regular_market_last_close: 777
        },
        {
          ...mockSamsungElec,
          regularMarketLastClose: 77777,
          regular_market_last_close: 77777
        },
      ]);
    });
    
    it.todo('should return { symbol, regularMarketLastClose } of updated records');
    
    it('should return empty Array if updateArr is empty', async () => {
      const result = await financialAssetSrv.updatePriceMany([]);
      expect(result).toEqual([]);
    });
  });
});

const getTestingInstances = async (): Promise<TestingInstances> => {
  const module = await moduleBuilder.compile();
  return {
    exchangeSrv: module.get(Database_ExchangeService),
    financialAssetSrv: module.get(Database_FinancialAssetService),
    dataSource: module.get(DataSource),
  };
};

const moduleBuilder = Test.createTestingModule({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule,
        NestConfigModule.forRoot(options),
      ],
      useClass: TypeOrmOptionsService,
      inject: [
        AppConfigService,
        PostgresConfigService,
      ]
    }),
    TypeOrmModule.forFeature([FinancialAssetEntity]),
    TypeOrmModule.forFeature([ExchangeEntity])
  ],
  providers: [
    Database_ExchangeService,
    Database_FinancialAssetService
  ],
});

type TestingInstances = {
  exchangeSrv: Database_ExchangeService;
  financialAssetSrv: Database_FinancialAssetService;
  dataSource: DataSource;
};