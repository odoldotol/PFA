import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app/app.module';

describe('Application Start', () => {
  describe('Updater 초기화', () => {
    it.todo('모든 거래소에 대한 업데이트 스케쥴 이 생성되어야 함');
    it.todo('최신상태의 마켓 => 업데이트 스케쥴 생성');
    it.todo('최신상태가 아니고 장중이 아닌(closed) 마켓 => 업데이트 후 업데이트 스케쥴 생성');
    it.todo('최신상태가 아니고 장중인(open) 마켓 => 업데이트 스케쥴 생성');
  });
});

describe('Asset', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });


  describe('POST /price/ticker/{ticker}', () => {
    it.todo('MongoDB 에 있음 => 반환');
    it.todo('MongoDB 에 없음, market 모듈에 fetching, MongoDB 에 새로운 Asset 생성 => 생성 정보와 함께 반환');
    it.todo('결국 찾지못함 => Not Found');

  });
  describe('POST /price/exchange/{ISO_Code}', () => {
    it.todo('MongoDB 기반, 해당 거래소 종속 Asset 반환');
  });
});

// TODO: 스케줄러. => (unit test)

// TODO: 하나의 거래소에 대한 업데이터는 하나의 트랜젝션이고 업데이트를 product 에 전파한다. => (unit test)
// - 해당 거래소의 모든 Assets 의 가격을 업데이트를 시도. (일부 자산의 업데이트 실패는 트렉젝션의 실패가 아님)
// - 거래소의 데이터의 날짜 (거래소 상태) 를 업데이트. (실패시 트렉젝션 실패)
// - 업데이트 결과로그를 DB에 생성. (실패시 트렉젝션 실패)

// TODO: asset 생성시 일어나는일. => (unit test)
// 새로운 Asset 을 생성할 때 마다 거래소를 확인한다.
// 만약, 서버에서 관리하지 않는 새로운 거래소가 발견되면 해당 거래소를 기반으로 업데이트에 필요한 데이터를 생성하고
// 새로운 업데이트스케쥴을 만들고 시작함.