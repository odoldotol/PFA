import { DataSource } from "typeorm";
import seeder from "../seeder";
import {
  getSeedUsersQuery,
  getSeedAssetSubscriptionsQuery
} from "./common";

enum DataSourceVersion {
  DEFAULT = 'default',
  TEST = 'test',
}

(async function () {  
  const dataSourceVersion: DataSourceVersion
  = process.argv[3] === 'test' ? DataSourceVersion.TEST
  : DataSourceVersion.DEFAULT;

  const userCount = Number(process.argv[2]);
  if (!userCount) {
    console.error('bad argument: USER_COUNT');
    process.exit(1);
  }

  const dataSource = await getDataSource(dataSourceVersion);

  await dataSource.initialize();

  const usersIdSeqName = await dataSource.query(
    "SELECT pg_get_serial_sequence('public.users', 'id');"
  ).then(res => res[0].pg_get_serial_sequence as string);

  const usersIdSeq = await dataSource.query(
    `SELECT nextval('${usersIdSeqName}');`
  ).then(res => Number(res[0].nextval) as number) + 1;

  console.log('[kakaoChatbotApiBenchmark-dev] 시작할 users_id_seq:', usersIdSeq);
  
  await seeder(dataSource, [
    {
      name: "Empty tables(users, asset_subscriptions)",
      query: "TRUNCATE users, asset_subscriptions;",
    },
    {
      name: "Seed users",
      query: getSeedUsersQuery(userCount)
    },
    {
      name: "Seed asset_subscriptions",
      query: getSeedAssetSubscriptionsQuery(userCount, usersIdSeq)
    }
  ]);

  await dataSource.destroy();
})();

async function getDataSource(
  dataSourceVersion: DataSourceVersion
): Promise<DataSource> {
  let dataSourceModule;
  switch (dataSourceVersion) {
    case DataSourceVersion.DEFAULT:
      dataSourceModule = await import("../../typeormDataSource/postgres");
      break;
    case DataSourceVersion.TEST:
      dataSourceModule = await import("../../typeormDataSource/postgres.testdb");
      break;
  }

  if (
    dataSourceVersion === DataSourceVersion.DEFAULT &&
    process.env['RACK_ENV'] === 'production'
  ) {
    throw new Error('이 에러는 Production 데이터베이스에 대한 제가 의도하지 않은 Seeding 을 막기 위한 에러입니다.');
  }

  return dataSourceModule.default;
}
