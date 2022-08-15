import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ManagerService } from './manager.service';

describe('ManagerService', () => {
  let service: ManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env.development.local"
        }),
        HttpModule
      ],
      providers: [ManagerService],
    }).compile();

    service = module.get<ManagerService>(ManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getInfoByTickerList', () => {

    it('getMArket 서버로 요청을 보내 info 객체 배열을 받아와 리턴해야함', async () => {
      const tickerArr = ["AAPL", "MSFT"]
      const result = await service.getInfoByTickerList(tickerArr)
      expect(result[0].symbol).toEqual(tickerArr[0])
      expect(result[1].symbol).toEqual(tickerArr[1])
    })
    
    it('잘못된 응답', () => {})
    it('응답 시간', () => {})
  })


  describe('createByTickerList', () => {

    it('DB에 데이터를 생성하고 생성한 데이터를 리턴해야함', () => {

    })

    it('이미 존재하는 데이터 확인 처리', () => {})
    it('데이터생성 실패', () => {})
    it('info객체 받아오기 실패', () => {})
    it('잘못된 info객체 받아옴', () => {})
    it('info 객체 응답 시간', () => {})
  })

  describe('updateByTickerList', () => {

    it('DB에 존재하는 info를 덮어씌우기', () => {

    })

    it('DB에 존재하지 않을 경우', () => {})
    it('', () => {})
  })
  
  describe('deleteByTickerList', () => {

    it('DB에 존재하는 info를 삭제해야함', () => {

    })

    it('DB에 존재하지 않을 경우', () => {})
    it('', () => {})
  })

});