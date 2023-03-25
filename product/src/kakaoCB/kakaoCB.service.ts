import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarketService } from '../market/market.service';

@Injectable()
export class KakaoCBService {

    private readonly KAKAO_CHATBOT_VERSION: string = this.configService.get('KAKAO_CHATBOT_VERSION');

    constructor(
        private readonly configService: ConfigService,
        private readonly marketService: MarketService,
    ) {}

    inquire = async (body: SkillPayload): Promise<SkillResponse> => {
        let kakaoText: string;
        const price = await this.marketService.getPrice(
            body.action.params.ticker.toUpperCase(),
            body.userRequest.user.id
        ).catch((err): undefined => (kakaoText = err.message, undefined));
        kakaoText = price && `${(price.price + Number.EPSILON).toFixed(2)}${this.currencyToSign(price.currency)} (${price.marketDate})`;
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
            data: {...price, kakaoText},
        }
    }

    private currencyToSign = (currency: string) => {
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
                return '';
        }
    }

}
