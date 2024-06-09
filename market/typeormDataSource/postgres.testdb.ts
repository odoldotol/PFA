import { DataSource } from 'typeorm';
import dataSourceOptions from './options/postgres';

const TEST_DATABASE_NAME_SUFFIX = '_test';

Object.assign(dataSourceOptions, {
  database: dataSourceOptions.database + TEST_DATABASE_NAME_SUFFIX,
});

if (process.env['RACK_ENV'] !== 'production') {
  throw new Error('이 에러는 테스트코드 실행용 데이터베이스에 대한 제가 의도하지 않은 접속을 막기 위한 임시적 에러입니다.');
}

export default new DataSource(dataSourceOptions);
