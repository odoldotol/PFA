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
    async inquire(body: any): Promise<SkillResponse> {
        const p = await this.marketService.getPriceByTicker(body.action.params.ticker, body.userRequest.user.id)
        return {
            version: this.KAKAO_CHATBOT_VERSION,
            template: {
                outputs: [
                    {
                        simpleText: {
                            text: `${(p.price + Number.EPSILON).toFixed(2)} (${p.marketDate})`,
                        },
                    },
                ],
            },
        }
    }

}
