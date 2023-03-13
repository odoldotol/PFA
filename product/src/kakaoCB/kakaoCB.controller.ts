import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KakaoCBService } from './kakaoCB.service';
import { SkillPayloadDto } from './dto/SkillPayload.dto';

@Controller('kakaoCB')
export class KakaoCBController {

    private readonly KAKAO_CHATBOT_ID: string = this.configService.get('KAKAO_CHATBOT_ID');

    constructor(
        private readonly configService: ConfigService,
        private readonly kakaoCBService: KakaoCBService,
    ) {}

    /**
     * ###
     */
    @Post('inquire')
    inquire(@Body() body/*: SkillPayloadDto*/) {
        if (body.bot.id !== this.KAKAO_CHATBOT_ID) {
            throw new UnauthorizedException();
        };
        // console.log(body);
        return this.kakaoCBService.inquire(body);
    }
}
