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

    /**
     * ###
     */
    async inquire(body: SkillPayload): Promise<SkillResponse> {
        let kakaoText: string;
        const kakaoData = await this.marketService.getPriceByTicker(body.action.params.ticker.toUpperCase(), body.userRequest.user.id)
        .then(res => (kakaoText = `${(res.price + Number.EPSILON).toFixed(2)}${this.currencyToSign(res.currency)} (${res.marketDate})`, res))
        .catch(err => kakaoText = err.message);
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
            data: kakaoData,
        }
    }

    /**
     * ###
     */
    currencyToSign(currency: string): string {
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
