import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios'
import { of } from 'rxjs';
import { Yf_info } from '../schema/yf_info.schema';
import { ManagerService } from './manager.service';

describe('ManagerService', () => {
  let service: ManagerService;
  let mockHttpService: HttpService;
  let configService: ConfigService;
  const yf_infoModel = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManagerService,
        ConfigService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          }
        },
        {
          provide: getModelToken(Yf_info.name),
          useValue: yf_infoModel,
        }
      ],
    }).compile();

    service = module.get<ManagerService>(ManagerService);
    mockHttpService = module.get(HttpService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getInfoByTickerList', () => {

    it('getMArket 서버로 요청을 보내 info 객체 배열을 받아와 리턴해야함', async () => {
      
      const resData = info.aaplmsft;
      const axiosRes: AxiosResponse = {
        data: resData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      }
      
      const testTickerArr = ["AAPL", "MSFT"]

      jest.spyOn(mockHttpService, 'post').mockImplementation((url, tickerArr) => 
        tickerArr === testTickerArr && url === `${configService.get('GETMARKET_URL')}yf/info`
          ? of(axiosRes)
          : of(null)
      );

      const expected = service.getInfoByTickerList(testTickerArr);

      expect(expected).resolves.toEqual(resData);
    })
    
    it('잘못된 응답', () => {})
    it('응답 시간', () => {})
  })


  describe('createByTickerList', () => {

    it('DB에 데이터를 생성하고 생성한 데이터를 리턴해야함', () => {

    })

    it('error info 가 포함된 경우에는 error info를 제외하고 데이터를 생성해야 함', () => {})
    it('error info 가 포함된 경우에는 정상 응답에 error 가 포함되어야 함', () => {})
    // it('error info 가 포함된 경우에는 error 들의 인덱스를 배열에 담에 반환해야함', () => {})
    it('데이터생성 실패', () => {})
    it('이미 존재하는 심볼 확인 처리', () => {})
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

const info = {
  aaplmsft: [{"zip":"95014","sector":"Technology","fullTimeEmployees":154000,"longBusinessSummary":"Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. It also sells various related services. In addition, the company offers iPhone, a line of smartphones; Mac, a line of personal computers; iPad, a line of multi-purpose tablets; AirPods Max, an over-ear wireless headphone; and wearables, home, and accessories comprising AirPods, Apple TV, Apple Watch, Beats products, HomePod, and iPod touch. Further, it provides AppleCare support services; cloud services store services; and operates various platforms, including the App Store that allow customers to discover and download applications and digital content, such as books, music, video, games, and podcasts. Additionally, the company offers various services, such as Apple Arcade, a game subscription service; Apple Music, which offers users a curated listening experience with on-demand radio stations; Apple News+, a subscription news and magazine service; Apple TV+, which offers exclusive original content; Apple Card, a co-branded credit card; and Apple Pay, a cashless payment service, as well as licenses its intellectual property. The company serves consumers, and small and mid-sized businesses; and the education, enterprise, and government markets. It distributes third-party applications for its products through the App Store. The company also sells its products through its retail and online stores, and direct sales force; and third-party cellular network carriers, wholesalers, retailers, and resellers. Apple Inc. was incorporated in 1977 and is headquartered in Cupertino, California.","city":"Cupertino","phone":"408 996 1010","state":"CA","country":"United States","companyOfficers":[],"website":"https://www.apple.com","maxAge":1,"address1":"One Apple Park Way","industry":"Consumer Electronics","ebitdaMargins":0.3343,"profitMargins":0.25709,"grossMargins":0.43313998,"operatingCashflow":118224003072,"revenueGrowth":0.019,"operatingMargins":0.30533,"ebitda":129556996096,"targetLowPrice":136,"recommendationKey":"buy","grossProfits":152836000000,"freeCashflow":83344621568,"targetMedianPrice":185,"currentPrice":172.1,"earningsGrowth":-0.077,"currentRatio":0.865,"returnOnAssets":0.22204,"numberOfAnalystOpinions":44,"targetMeanPrice":182.51,"debtToEquity":205.984,"returnOnEquity":1.62816,"targetHighPrice":214,"totalCash":48230998016,"totalDebt":119691001856,"totalRevenue":387541991424,"totalCashPerShare":3.001,"financialCurrency":"USD","revenuePerShare":23.732,"quickRatio":0.697,"recommendationMean":1.9,"exchange":"NMS","shortName":"Apple Inc.","longName":"Apple Inc.","exchangeTimezoneName":"America/New_York","exchangeTimezoneShortName":"EDT","isEsgPopulated":false,"gmtOffSetMilliseconds":"-14400000","quoteType":"EQUITY","symbol":"AAPL","messageBoardId":"finmb_24937","market":"us_market","annualHoldingsTurnover":null,"enterpriseToRevenue":7.321,"beta3Year":null,"enterpriseToEbitda":21.9,"52WeekChange":0.13883007,"morningStarRiskRating":null,"forwardEps":6.44,"revenueQuarterlyGrowth":null,"sharesOutstanding":16070800384,"fundInceptionDate":null,"annualReportExpenseRatio":null,"totalAssets":null,"bookValue":3.61,"sharesShort":107535584,"sharesPercentSharesOut":0.0067000003,"fundFamily":null,"lastFiscalYearEnd":1632528000,"heldPercentInstitutions":0.60085,"netIncomeToCommon":99632996352,"trailingEps":6.05,"lastDividendValue":0.23,"SandP52WeekChange":-0.0445475,"priceToBook":47.673134,"heldPercentInsiders":0.0007,"nextFiscalYearEnd":1695600000,"yield":null,"mostRecentQuarter":1656115200,"shortRatio":1.47,"sharesShortPreviousMonthDate":1656547200,"floatShares":16053234880,"beta":1.230174,"enterpriseValue":2837236416512,"priceHint":2,"threeYearAverageReturn":null,"lastSplitDate":1598832000,"lastSplitFactor":"4:1","legalType":null,"lastDividendDate":1659657600,"morningStarOverallRating":null,"earningsQuarterlyGrowth":-0.106,"priceToSalesTrailing12Months":7.136736,"dateShortInterest":1659052800,"pegRatio":2.81,"ytdReturn":null,"forwardPE":26.723602,"lastCapGain":null,"shortPercentOfFloat":0.0067000003,"sharesShortPriorMonth":112994371,"impliedSharesOutstanding":0,"category":null,"fiveYearAverageReturn":null,"previousClose":168.49,"regularMarketOpen":169.82,"twoHundredDayAverage":159.8798,"trailingAnnualDividendYield":0.0052822125,"payoutRatio":0.1471,"volume24Hr":null,"regularMarketDayHigh":172.17,"navPrice":null,"averageDailyVolume10Day":64104310,"regularMarketPreviousClose":168.49,"fiftyDayAverage":148.778,"trailingAnnualDividendRate":0.89,"open":169.82,"toCurrency":null,"averageVolume10days":64104310,"expireDate":null,"algorithm":null,"dividendRate":0.92,"exDividendDate":1659657600,"circulatingSupply":null,"startDate":null,"regularMarketDayLow":169.4,"currency":"USD","trailingPE":28.446281,"regularMarketVolume":68039382,"lastMarket":null,"maxSupply":null,"openInterest":null,"marketCap":2765784875008,"volumeAllCurrencies":null,"strikePrice":null,"averageVolume":80404119,"dayLow":169.4,"ask":0,"askSize":1300,"volume":68039382,"fiftyTwoWeekHigh":182.94,"fromCurrency":null,"fiveYearAvgDividendYield":1.05,"fiftyTwoWeekLow":129.04,"bid":0,"tradeable":false,"dividendYield":0.0053,"bidSize":3100,"dayHigh":172.17,"coinMarketCapLink":null,"regularMarketPrice":172.1,"preMarketPrice":null,"logo_url":"https://logo.clearbit.com/apple.com","trailingPegRatio":3.0777},{"zip":"98052-6399","sector":"Technology","fullTimeEmployees":221000,"longBusinessSummary":"Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. The company operates in three segments: Productivity and Business Processes, Intelligent Cloud, and More Personal Computing. The Productivity and Business Processes segment offers Office, Exchange, SharePoint, Microsoft Teams, Office 365 Security and Compliance, Microsoft Viva, and Skype for Business; Skype, Outlook.com, OneDrive, and LinkedIn; and Dynamics 365, a set of cloud-based and on-premises business solutions for organizations and enterprise divisions. The Intelligent Cloud segment licenses SQL, Windows Servers, Visual Studio, System Center, and related Client Access Licenses; GitHub that provides a collaboration platform and code hosting service for developers; Nuance provides healthcare and enterprise AI solutions; and Azure, a cloud platform. It also offers enterprise support, Microsoft consulting, and nuance professional services to assist customers in developing, deploying, and managing Microsoft server and desktop solutions; and training and certification on Microsoft products. The More Personal Computing segment provides Windows original equipment manufacturer (OEM) licensing and other non-volume licensing of the Windows operating system; Windows Commercial, such as volume licensing of the Windows operating system, Windows cloud services, and other Windows commercial offerings; patent licensing; and Windows Internet of Things. It also offers Surface, PC accessories, PCs, tablets, gaming and entertainment consoles, and other devices; Gaming, including Xbox hardware, and Xbox content and services; video games and third-party video game royalties; and Search, including Bing and Microsoft advertising. The company sells its products through OEMs, distributors, and resellers; and directly through digital marketplaces, online stores, and retail stores. Microsoft Corporation was founded in 1975 and is headquartered in Redmond, Washington.","city":"Redmond","phone":"425 882 8080","state":"WA","country":"United States","companyOfficers":[],"website":"https://www.microsoft.com","maxAge":1,"address1":"One Microsoft Way","fax":"425 706 7329","industry":"Software—Infrastructure","ebitdaMargins":0.49418998,"profitMargins":0.36686,"grossMargins":0.68402,"operatingCashflow":89034997760,"revenueGrowth":0.124,"operatingMargins":0.42055,"ebitda":97982996480,"targetLowPrice":275,"recommendationKey":"buy","grossProfits":135620000000,"freeCashflow":49479000064,"targetMedianPrice":330,"currentPrice":291.91,"earningsGrowth":0.031,"currentRatio":1.785,"returnOnAssets":0.14919,"numberOfAnalystOpinions":46,"targetMeanPrice":336.06,"debtToEquity":47.075,"returnOnEquity":0.47151002,"targetHighPrice":411,"totalCash":104748998656,"totalDebt":78399995904,"totalRevenue":198269992960,"totalCashPerShare":14.045,"financialCurrency":"USD","revenuePerShare":26.45,"quickRatio":1.567,"recommendationMean":1.7,"exchange":"NMS","shortName":"Microsoft Corporation","longName":"Microsoft Corporation","exchangeTimezoneName":"America/New_York","exchangeTimezoneShortName":"EDT","isEsgPopulated":false,"gmtOffSetMilliseconds":"-14400000","quoteType":"EQUITY","symbol":"MSFT","messageBoardId":"finmb_21835","market":"us_market","annualHoldingsTurnover":null,"enterpriseToRevenue":10.847,"beta3Year":null,"enterpriseToEbitda":21.95,"52WeekChange":-0.009131014,"morningStarRiskRating":null,"forwardEps":12.11,"revenueQuarterlyGrowth":null,"sharesOutstanding":7457889792,"fundInceptionDate":null,"annualReportExpenseRatio":null,"totalAssets":null,"bookValue":22.313,"sharesShort":38192351,"sharesPercentSharesOut":0.0050999997,"fundFamily":null,"lastFiscalYearEnd":1656547200,"heldPercentInstitutions":0.72233003,"netIncomeToCommon":72737996800,"trailingEps":9.65,"lastDividendValue":0.62,"SandP52WeekChange":-0.0445475,"priceToBook":13.082508,"heldPercentInsiders":0.00075,"nextFiscalYearEnd":1719705600,"yield":null,"mostRecentQuarter":1656547200,"shortRatio":1.43,"sharesShortPreviousMonthDate":1656547200,"floatShares":7450657717,"beta":0.927206,"enterpriseValue":2150684164096,"priceHint":2,"threeYearAverageReturn":null,"lastSplitDate":1045526400,"lastSplitFactor":"2:1","legalType":null,"lastDividendDate":1652832000,"morningStarOverallRating":null,"earningsQuarterlyGrowth":0.017,"priceToSalesTrailing12Months":10.980142,"dateShortInterest":1659052800,"pegRatio":1.8,"ytdReturn":null,"forwardPE":24.104874,"lastCapGain":null,"shortPercentOfFloat":0.0050999997,"sharesShortPriorMonth":38896339,"impliedSharesOutstanding":0,"category":null,"fiveYearAverageReturn":null,"previousClose":287.02,"regularMarketOpen":288.48,"twoHundredDayAverage":294.5549,"trailingAnnualDividendYield":0.008640513,"payoutRatio":0.2508,"volume24Hr":null,"regularMarketDayHigh":291.91,"navPrice":null,"averageDailyVolume10Day":21217930,"regularMarketPreviousClose":287.02,"fiftyDayAverage":265.078,"trailingAnnualDividendRate":2.48,"open":288.48,"toCurrency":null,"averageVolume10days":21217930,"expireDate":null,"algorithm":null,"dividendRate":2.48,"exDividendDate":1660694400,"circulatingSupply":null,"startDate":null,"regularMarketDayLow":286.94,"currency":"USD","trailingPE":30.249743,"regularMarketVolume":22619675,"lastMarket":null,"maxSupply":null,"openInterest":null,"marketCap":2177032650752,"volumeAllCurrencies":null,"strikePrice":null,"averageVolume":27637985,"dayLow":286.94,"ask":0,"askSize":1000,"volume":22619675,"fiftyTwoWeekHigh":349.67,"fromCurrency":null,"fiveYearAvgDividendYield":1.23,"fiftyTwoWeekLow":241.51,"bid":0,"tradeable":false,"dividendYield":0.0085,"bidSize":1300,"dayHigh":291.91,"coinMarketCapLink":null,"regularMarketPrice":291.91,"preMarketPrice":null,"logo_url":"https://logo.clearbit.com/microsoft.com","trailingPegRatio":2.1539}]
}