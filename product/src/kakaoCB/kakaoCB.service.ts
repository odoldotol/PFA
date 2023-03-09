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
        return {
            version: this.KAKAO_CHATBOT_VERSION,
            template: {
                outputs: [
                    {
                        simpleText: {
                            text: await this.marketService.getPriceByTicker(body.action.params.ticker.toUpperCase(), body.userRequest.user.id)
                            .then(res => `${(res.price + Number.EPSILON).toFixed(2)} (${res.marketDate})`)
                            .catch(err => err.message)
                        },
                    },
                ],
            },
        }
    }

}
