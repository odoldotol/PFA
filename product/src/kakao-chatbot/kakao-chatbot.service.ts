import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarketService } from '../market/market.service';
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { EnvKey } from 'src/common/enum/envKey.emun';
import { SkillPayload } from './interface/skillPayload.interface';
import { SkillResponse } from './response/skill.response';

@Injectable()
export class KakaoCBService {

  private readonly KAKAO_CHATBOT_VERSION
  = this.configService.get(EnvKey.KAKAO_CHATBOT_VERSION, '2.0', { infer: true });

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly marketService: MarketService,
  ) {}

  // Todo: Refac
  public async inquire(body: SkillPayload): Promise<SkillResponse> {
    let kakaoText: string = '';
    const price = await this.marketService.getPrice(
      body.action.params.ticker.toUpperCase(),
      body.userRequest?.user.id
    ).then(p => p && (kakaoText = `${(p.price + Number.EPSILON).toFixed(2)}${this.getCurrencySign(p.currency)} (${p.marketDate})`, p)
    ).catch((err): undefined => (kakaoText = err.message, undefined));

    return {
      version: this.KAKAO_CHATBOT_VERSION,
      template: {
        outputs: [
          {
            simpleText: {
              text: kakaoText
            },
          },
        ],
      },
      data: { ...price, kakaoText },
    }
  }

  // Todo: Currency Enum 만들어서 쓰기
  // Todo: 메서드 추출하기
  private getCurrencySign(currency: string, signDefault = "") {
    switch (currency) {
      case 'USD':
        return ' $';
      case 'EUR':
        return ' €';
      case 'JPY':
        return ' ¥';
      case 'GBP':
        return ' £';
      case 'CNY':
        return ' ¥';
      case 'KRW':
        return ' ₩';
      default:
        return signDefault;
    }
  }

}
