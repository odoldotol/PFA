import {
  existsSync,
  readFileSync,
} from 'fs';
import * as path from 'path';
import { DataSource } from "typeorm";
import seeder from "../seeder";

enum DataSourceVersion {
  DEFAULT = 'default',
  TEST = 'test',
}

(async function () {
  const dataSourceVersion: DataSourceVersion
  = process.argv[2] === 'test' ? DataSourceVersion.TEST
  : DataSourceVersion.DEFAULT;

  const dataSource = await getDataSource(dataSourceVersion);

  const SQL_DIR = path.join(__dirname, "..", "sql");

  const SQL_FILENAMES = [
    "insert.russell-1000-index-05-13-2024.T20240604.sql",
    "insert.russell-2000-index-05-14-2024-page-1.T20240604.sql",
    "insert.kospi-all-05-13-2024.T20240604.sql",
    "insert.kosdaq-all-05-13-2024-cut-1-500.T20240604.sql",
    "insert.kosdaq-all-05-13-2024-cut-501-1000.T20240604.sql",
  ];

  SQL_FILENAMES.forEach(filename => {
    const filePath = path.join(SQL_DIR, filename);
    if (!existsSync(filePath)) {
      throw new Error(`Query file '${filename}' not found.`);
    }
  });

  console.log(`[simple_dev_20240513] 3916 records will be inserted
  RUSSELL 1997
  KOSPI 950
  KOSDAQ 969`);

  await dataSource.initialize();
  
  await seeder(dataSource, [
    {
      name: "Empty table(financial_assets)",
      query: "TRUNCATE financial_assets;",
    },
    ...SQL_FILENAMES.map(filename => ({
      name: filename,
      query: readFileSync(path.join(SQL_DIR, filename), 'utf8'),
    })),
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
