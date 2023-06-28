import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app/app.module';

/**
 * TODO: 앱 구동 업데이터 초기화
 * - 최신인경우
 *   => 업뎃 스케쥴 생성
 * - 최신 아닌경우
 *   - 장중아닌경우
 *   => 업데이트 후 업뎃 스케쥴 생성
 *   - 장중인경우
 *   => 업뎃 스케쥴 생성
 */

// TODO: 스케줄러(unit?)

// TODO: 하나의 거래소에 대한 업데이터는 하나의 트랜젝션이고 업데이트를 product 에 전파한다.
// - 해당 거래소의 모든 Assets 의 가격을 업데이트를 시도. (일부 자산의 업데이트 실패는 트렉젝션의 실패가 아님)
// - 거래소의 데이터의 날짜 (거래소 상태) 를 업데이트. (실패시 트렉젝션 실패)
// - 업데이트 결과로그를 DB에 생성. (실패시 트렉젝션 실패)

/**
 * TODO: asset
 * mongoDB 에서 검색
 * 없으면 child 에 요청
 * mongodb 에 asset 생성하고 product 에 알려줌
 */

// TODO: asset 생성시 일어나는일
// 새로운 Asset 을 생성할 때 마다 거래소를 확인한다.
// 만약, 서버에서 관리하지 않는 새로운 거래소가 발견되면 해당 거래소를 기반으로 업데이트에 필요한 데이터를 생성하고
// 새로운 업데이트스케쥴을 만들고 시작함.

