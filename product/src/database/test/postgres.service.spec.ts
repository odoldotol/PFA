import { Test } from "@nestjs/testing";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { TypeOrmConfigService } from "../postgres/typeormConfig.service";
import {
  AssetSubscription,
  tableName as assetSubscriptionTableName
} from "../assetSubscription/assetSubscription.entity";
import { User, tableName as userTableName } from "../user/user.entity";
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

jest.setTimeout(10000);

describe('UserService', () => {
  let userSrv: UserService;
  let dataSource: DataSource;

  beforeEach(async () => {
    ({ userSrv, dataSource } = await getTestingInstances());
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

  let mockUserId: number;
  let mockUser2Id: number;

  describe('', () => {
    beforeEach(async () => {
      ({ userSrv, assetSubscriptionSrv, dataSource } = await getTestingInstances());
      await userSrv.createOneByBotUserKey(mockBotUserKey);
      await userSrv.createOneByBotUserKey(mockBotUserKey2);

      mockUserId = (await userSrv.readOneIdByBotUserKey(mockBotUserKey))!;
      mockUser2Id = (await userSrv.readOneIdByBotUserKey(mockBotUserKey2))!;
    });

    afterEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.destroy();
    });

    it('should be defined', () => {
      expect(assetSubscriptionSrv).toBeDefined();
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

    describe('exists', () => {
      it('should return boolean whether the record exists or not', async () => {
        await expect(assetSubscriptionSrv.exists(mockUserId, mockAppleTicker))
        .resolves.toBe(false);
        await assetSubscriptionSrv.createOne(mockUserId, mockAppleTicker);
        await expect(assetSubscriptionSrv.exists(mockUserId, mockAppleTicker))
        .resolves.toBe(true);
      });
    });

    describe('deleteOne', () => {
      it('should delete the record', async () => {
        await assetSubscriptionSrv.createOne(mockUserId, mockAppleTicker);
        await expect(dataSource.query(`SELECT * FROM ${assetSubscriptionTableName}`))
        .resolves.toHaveLength(1);
        await assetSubscriptionSrv.deleteOne(mockUserId, mockAppleTicker);
        await expect(dataSource.query(`SELECT * FROM ${assetSubscriptionTableName}`))
        .resolves.toHaveLength(0);
      });

      it('should return boolean whether the record is deleted or dose not exist', async () => {
        await expect(assetSubscriptionSrv.deleteOne(mockUserId, mockAppleTicker))
        .resolves.toBe(false);
        await assetSubscriptionSrv.createOne(mockUserId, mockAppleTicker);
        await expect(assetSubscriptionSrv.deleteOne(mockUserId, mockAppleTicker))
        .resolves.toBe(true);
        await expect(assetSubscriptionSrv.deleteOne(mockUserId, mockAppleTicker))
        .resolves.toBe(false);
      });
    });
  });

  describe('', () => {
    describe('readTickersByUserId', () => {
      const numberOfUsers = 100;
      const numberOfTickers = 101;
      const mockBotUserKeyArr = Array.from(generateMockBotUserKey(numberOfUsers));
      const mockTickerArr = Array.from(generateMockTicker(numberOfTickers));

      beforeAll(async () => {
        ({ userSrv, assetSubscriptionSrv, dataSource } = await getTestingInstances());
        
        await dataSource.query(`
          INSERT INTO ${userTableName}
            (kakao_chatbot_user_key)
            VALUES
              ${mockBotUserKeyArr.map(key => `('${key}')`).join(',')}
        `);
        await dataSource.query(`
          INSERT INTO ${assetSubscriptionTableName}
            (id, user_id, ticker)
            VALUES
              ${Array.from({ length: numberOfUsers }, (_, i) => i + 1)
              .map(userId => mockTickerArr.map(ticker => `(DEFAULT, ${userId}, '${ticker}')`).join(','))
              .join(',')}
        `);
        await expect(dataSource.query(`SELECT COUNT(*) FROM ${userTableName}`))
        .resolves.toEqual([{ count: numberOfUsers.toString() }]);
        await expect(dataSource.query(`SELECT COUNT(*) FROM ${assetSubscriptionTableName}`))
        .resolves.toEqual([{ count: (numberOfUsers * numberOfTickers).toString() }]);
      });

      it('should return the 100 tickers in reverse order of creation', async () => {
        const result = await assetSubscriptionSrv.readTickersByUserId(1);
        // console.log(await dataSource.query(`
        //   EXPLAIN ANALYZE
        //   SELECT ticker
        //     FROM ${assetSubscriptionTableName}
        //     WHERE user_id = 1
        //     ORDER BY id DESC
        //     LIMIT 100
        // `));
        expect(result).toHaveLength(100);
        expect(result).toEqual(mockTickerArr.slice(1).reverse());
      });

      afterAll(async () => {
        await dataSource.dropDatabase();
        await dataSource.destroy();
      });
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
      imports: [
        ConfigModule.forRoot()
      ],
      useClass: TypeOrmConfigService,
      inject: [ConfigService]
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