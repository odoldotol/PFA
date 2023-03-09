import { Body, Controller, Post } from '@nestjs/common';
import { KakaoCBService } from './kakaoCB.service';
import { SkillPayloadDto } from './dto/SkillPayload.dto';

@Controller('kakaoCB')
export class KakaoCBController {

    constructor(
        private readonly kakaoCBService: KakaoCBService,
    ) {}

    /**
     * ###
     */
    @Post('inquire')
    inquire(@Body() body: any) {
        console.log(body);
        return this.kakaoCBService.inquire(body);
    }
}
