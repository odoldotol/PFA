import { Body, Controller, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { KakaoCBService } from './kakaoCB.service';
import { SkillPayloadDto } from './dto/SkillPayload.dto';
import { KakaoGuard } from './guard/kakao.guard';

@Controller('kakaoCB')
export class KakaoCBController {

    constructor(
        private readonly kakaoCBService: KakaoCBService,
    ) {}

    /**
     * ###
     */
    @Post('inquire')
    @UseGuards(KakaoGuard)
    inquire(@Body() body/*: SkillPayloadDto*/) {
        // console.log(body);
        return this.kakaoCBService.inquire(body);
    }
}
