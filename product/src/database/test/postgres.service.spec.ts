import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import {
  AppConfigService,
  ConfigModule,
  PostgresConfigService
} from "src/config";
import { TypeOrmOptionsService } from "../postgres/typeormOptions.service";
import {
  AssetSubscription,
  ENTITY_NAME as assetSubscriptionTableName
} from "../assetSubscription/assetSubscription.entity";
import { User, ENTITY_NAME as userTableName } from "../user/user.entity";
import { migrationRun } from "devMigrations/migration";
import { MigrationUpdatedAtTriggers } from "devMigrations/postgres/updatedAtTriggers-Migration";
import { AssetSubscriptionService } from "../assetSubscription/assetSubscription.service";
import { UserService } from "../user/user.service";
import { 
  mockBotUserKey,
  mockBotUserKey2,
  generateMockBotUserKey
} from "../mock";
import {
  mockAppleTicker,
  mockSamsungTicker,
  generateMockTicker
} from "src/mock";

jest.setTimeout(5000);

describe('UserService', () => {
  let userSrv: UserService;
  let dataSource: DataSource;

  beforeEach(async () => {
    ({ userSrv, dataSource } = await getTestingInstances());

    await migrationRun(MigrationUpdatedAtTriggers, dataSource);
  });

  afterEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(userSrv).toBeDefined();
  });

  describe('createOneByBotUserKey', () => {
    it('should create a record in users table', async () => {
      await expect(dataSource.query(`SELECT * FROM ${userTableName}`)).resolves.toHaveLength(0);
      await userSrv.createOneByBotUserKey(mockBotUserKey);
      const result = await dataSource.query(`SELECT * FROM ${userTableName}`);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('kakao_chatbot_user_key', mockBotUserKey);
    });

    it('should return the created record', async () => {
      await expect(userSrv.createOneByBotUserKey(mockBotUserKey))
      .resolves.toHaveProperty('kakao_chatbot_user_key', mockBotUserKey);
    });

    it('should throw an error when the same bot user key already exists', async () => {
      await userSrv.createOneByBotUserKey(mockBotUserKey);
      await expect(userSrv.createOneByBotUserKey(mockBotUserKey)).rejects.toThrow();
    });
  });

  describe('readOneIdByBotUserKey', () => {
    it('should return the id of the record when the record exists', async () => {
      await userSrv.createOneByBotUserKey(mockBotUserKey);
      await expect(userSrv.readOneIdByBotUserKey(mockBotUserKey)).resolves.toEqual(1);
      await userSrv.createOneByBotUserKey(mockBotUserKey2);
      await expect(userSrv.readOneIdByBotUserKey(mockBotUserKey2)).resolves.toEqual(2);
    });

    it('should return null when the record does not exist', async () => {
      await userSrv.createOneByBotUserKey(mockBotUserKey);
      await expect(userSrv.readOneIdByBotUserKey(mockBotUserKey2)).resolves.toBeNull();
    });
  });
});

describe('AssetSubscriptionService', () => {
  let userSrv: UserService;
  let assetSubscriptionSrv: AssetSubscriptionService;
  let dataSource: DataSource;

  it('should be defined', async () => {
    ({ assetSubscriptionSrv, dataSource } = await getTestingInstances());
    expect(assetSubscriptionSrv).toBeDefined();
    await dataSource.destroy();
  });

  describe('Create, Update, Delete', () => {
    let mockUserId: number;
    let mockUser2Id: number;

    beforeEach(async () => {
      ({ userSrv, assetSubscriptionSrv, dataSource } = await getTestingInstances());

      await migrationRun(MigrationUpdatedAtTriggers, dataSource);

      await userSrv.createOneByBotUserKey(mockBotUserKey);
      await userSrv.createOneByBotUserKey(mockBotUserKey2);

      mockUserId = (await userSrv.readOneIdByBotUserKey(mockBotUserKey))!;
      mockUser2Id = (await userSrv.readOneIdByBotUserKey(mockBotUserKey2))!;
    });

    afterEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.destroy();
    });

    describe('createOne', () => {
      it('should create a record in asset_subscriptions table', async () => {
        await expect(dataSource.query(`SELECT * FROM ${assetSubscriptionTableName}`))
        .resolves.toHaveLength(0);
        await assetSubscriptionSrv.createOne(mockUserId, mockAppleTicker);
        const result = await dataSource.query(`SELECT * FROM ${assetSubscriptionTableName}`);
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('user_id', mockUserId);
        expect(result[0]).toHaveProperty('ticker', mockAppleTicker);
        expect(result[0]).toHaveProperty('activate', true);
      });

      it('should return the created record', async () => {
        const result = await assetSubscriptionSrv.createOne(mockUserId, mockAppleTicker)
        expect(result).toHaveProperty('ticker', mockAppleTicker);
        expect(result).toHaveProperty('user_id', mockUserId);
      });

      it('should throw an error when the same user_id and ticker already exists', async () => {
        await expect(assetSubscriptionSrv.createOne(mockUserId, mockAppleTicker))
        .resolves.toBeDefined();
        await expect(assetSubscriptionSrv.createOne(mockUserId, mockAppleTicker))
        .rejects.toThrow();
        await expect(assetSubscriptionSrv.createOne(mockUser2Id, mockAppleTicker))
        .resolves.toBeDefined();
        await expect(assetSubscriptionSrv.createOne(mockUserId, mockSamsungTicker))
        .resolves.toBeDefined();
        await expect(dataSource.query(`SELECT * FROM ${assetSubscriptionTableName}`))
        .resolves.toHaveLength(3);
      });
    });

    describe('updateOneActivate', () => {
      const getRecord = () => dataSource.query<AssetSubscription[]>(`
        SELECT * FROM ${assetSubscriptionTableName}
          WHERE user_id = ${mockUserId} AND ticker = '${mockAppleTicker}'
      `).then(res => res[0]);

      it('should update the activate of the record', async () => {
        await assetSubscriptionSrv.createOne(mockUserId, mockAppleTicker);
        await expect(getRecord()).resolves.toHaveProperty('activate', true);
        await assetSubscriptionSrv.updateOneActivate(mockUserId, mockAppleTicker, false);
        await expect(getRecord()).resolves.toHaveProperty('activate', false);
        await assetSubscriptionSrv.updateOneActivate(mockUserId, mockAppleTicker, true);
        await expect(getRecord()).resolves.toHaveProperty('activate', true);
      });

      it('should return the updated record', async () => {
        await assetSubscriptionSrv.createOne(mockUserId, mockAppleTicker);
        const result = await assetSubscriptionSrv.updateOneActivate(mockUserId, mockAppleTicker, false);
        expect(result).toHaveProperty('activate', false);
      });

      it('should return null when the record does not exist', async () => {
        await expect(assetSubscriptionSrv.updateOneActivate(mockUserId, mockAppleTicker, false))
        .resolves.toBeNull();
        await expect(getRecord()).resolves.toBeUndefined();
      });
    });
  });

  describe('Read', () => {
    const numberOfMockBotUserKey = 1000;
    const numberOfMockTicker = 500;

    const numberOfSeedUser = 10;
    const numberOfSeedAssetSubscription = 101;

    expect(numberOfMockBotUserKey).toBeGreaterThan(numberOfSeedUser);
    expect(numberOfMockTicker).toBeGreaterThan(numberOfSeedAssetSubscription);

    const mockBotUserKeyArr = Array.from(generateMockBotUserKey(numberOfMockBotUserKey));
    const mockTickerArr = Array.from(generateMockTicker(numberOfMockTicker));

    const seedBotUserKeyArr = mockBotUserKeyArr.slice(0, numberOfSeedUser);
    const seedTickerArr = mockTickerArr.slice(0, numberOfSeedAssetSubscription);

    beforeAll(async () => {
      ({ userSrv, assetSubscriptionSrv, dataSource } = await getTestingInstances());

      await migrationRun(MigrationUpdatedAtTriggers, dataSource);

      await dataSource.query(`
        INSERT INTO ${userTableName}
          (kakao_chatbot_user_key)
          VALUES
            ${seedBotUserKeyArr.map(key => `('${key}')`).join(',')}
      `);

      const insertOneAssetSubscription = (
        user_id: number,
        ticker: string
      ) => dataSource.query(`
        INSERT INTO ${assetSubscriptionTableName}
          (id, user_id, ticker)
          VALUES
            (DEFAULT, ${user_id}, '${ticker}')
      `);

      const insertOneAssetSubscriptionParamsArr
      = seedTickerArr.flatMap(ticker => seedBotUserKeyArr.map((_, i): [number, string] => [i+1, ticker]));

      await insertOneAssetSubscriptionParamsArr.reduce(async (prev, params) => {
        await prev;
        return insertOneAssetSubscription(...params);
      }, Promise.resolve());

      // 전부 같은 타임스탬프로 빨리 인서트하기 (실행계획 테스트)
      // await dataSource.query(`
      //   INSERT INTO ${assetSubscriptionTableName}
      //     (id, user_id, ticker)
      //     VALUES
      //       ${Array.from({ length: numberOfSeedUser }, (_, i) => i + 1)
      //       .map(userId => seedTickerArr.map(ticker => `(DEFAULT, ${userId}, '${ticker}')`).join(','))
      //       .join(',')}
      // `);

      await expect(dataSource.query(`SELECT COUNT(*) FROM ${userTableName}`))
      .resolves.toEqual([{ count: numberOfSeedUser.toString() }]);
      await expect(dataSource.query(`SELECT COUNT(*) FROM ${assetSubscriptionTableName}`))
      .resolves.toEqual([{ count: (numberOfSeedUser * numberOfSeedAssetSubscription).toString() }]);
    });

    describe('readOneAcivate', () => {
      it('should return activate of a record that matches the user_id and ticker', async () => {
        const mockUserId = (await userSrv.readOneIdByBotUserKey(mockBotUserKeyArr[0]!))!;
        const result = await assetSubscriptionSrv.readOneAcivate(
          mockUserId,
          mockTickerArr[numberOfSeedAssetSubscription-1]!
        );
        expect(result).toHaveProperty('activate');
      });

      it('should return null when the record does not exist', async () => {
        const mockUserId = (await userSrv.readOneIdByBotUserKey(mockBotUserKeyArr[0]!))!;
        const result = await assetSubscriptionSrv.readOneAcivate(
          mockUserId,
          mockTickerArr[numberOfMockTicker-1]!
        );
        expect(result).toBeNull();
      });
    });

    describe('readActivatedTickersByUserId', () => {
      it('should return the 100 tickers in reverse order of creation', async () => {
        const mockUserId = (await userSrv.readOneIdByBotUserKey(mockBotUserKeyArr[0]!))!;
        let result = await assetSubscriptionSrv.readActivatedTickersByUserId(mockUserId);

        // 실행계획 테스트
        // console.log(await dataSource.query(`
        //   EXPLAIN ANALYZE
        //   SELECT ticker
        //     FROM ${assetSubscriptionTableName}
        //     WHERE user_id = 1 AND activate = true
        //     ORDER BY updated_at DESC
        //     LIMIT 100
        // `));

        expect(result).toHaveLength(Math.min(100, numberOfSeedAssetSubscription));
        expect(result).toEqual(
          seedTickerArr
          .slice(numberOfSeedAssetSubscription - 100)
          .reverse()
        );

        const updatedTickerIndex = Math.floor(numberOfSeedAssetSubscription / 2);
        const updatedTicker = seedTickerArr[updatedTickerIndex]!;
        
        await dataSource.query(`
          UPDATE ${assetSubscriptionTableName}
            SET activate = false
            WHERE user_id = ${mockUserId} AND ticker = '${updatedTicker}'
        `);
        await dataSource.query(`
          UPDATE ${assetSubscriptionTableName}
            SET activate = true
            WHERE user_id = ${mockUserId} AND ticker = '${updatedTicker}'
        `);

        result = await assetSubscriptionSrv.readActivatedTickersByUserId(mockUserId);

        expect(result).toHaveLength(Math.min(100, numberOfSeedAssetSubscription));
        
        const expected = seedTickerArr
        .slice(numberOfSeedAssetSubscription - 100)
        .reverse();
        expected.splice(updatedTickerIndex, 1);
        expected.unshift(updatedTicker);
        expect(result).toEqual(expected);
      });

      it('should return only activated', async () => {
        const mockUserId = (await userSrv.readOneIdByBotUserKey(mockBotUserKeyArr[0]!))!;
        const deActivatedTickerIndex = Math.floor(numberOfSeedAssetSubscription / 2);
        const deActivatedTicker = seedTickerArr[deActivatedTickerIndex]!;
        await dataSource.query(`
          UPDATE ${assetSubscriptionTableName}
            SET activate = false
            WHERE user_id = ${mockUserId} AND ticker = '${deActivatedTicker}'
        `);
        const result = await assetSubscriptionSrv.readActivatedTickersByUserId(mockUserId);
        expect(result).toHaveLength(Math.min(100, numberOfSeedAssetSubscription - 1));
        expect(result).not.toContain(deActivatedTicker);
      });
    });

    afterAll(async () => {
      await dataSource.dropDatabase();
      await dataSource.destroy();
    });
  });
});

const getTestingInstances = async (): Promise<TestingInstances> => {
  const module = await moduleBuilder.compile();
  return {
    userSrv: module.get(UserService),
    assetSubscriptionSrv: module.get(AssetSubscriptionService),
    dataSource: module.get(DataSource),
  };
};

const moduleBuilder = Test.createTestingModule({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmOptionsService,
      inject: [
        AppConfigService,
        PostgresConfigService
      ]
    }),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([AssetSubscription]),
  ],
  providers: [
    AssetSubscriptionService,
    UserService,
  ],
});

type TestingInstances = {
  userSrv: UserService;
  assetSubscriptionSrv: AssetSubscriptionService;
  dataSource: DataSource;
};