import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { KakaoCBService } from './kakao-chatbot.service';
import { KakaoChatbotGuard } from './guard/kakao-chatbot.guard';
import { SkillPayloadDto } from './dto/SkillPayload.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonResponse } from '@common/decorator/apiCommonResponse.decorator';
import { SkillResponse } from './response/skill.response';

@Controller('kakao-chatbot')
@UseGuards(KakaoChatbotGuard)
@ApiTags('Kakao Chatbot')
@ApiCommonResponse()
export class KakaoCBController {

    constructor(
        private readonly kakaoCBService: KakaoCBService,) {}

    @Post('inquire')
    @HttpCode(200)
    @ApiOperation({ summary: '카카오 챗봇 스킬1' })
    @ApiOkResponse({ description: '카카오 챗봇 스킬1', type: SkillResponse })
    inquire(@Body() body: SkillPayloadDto) {
        return this.kakaoCBService.inquire(body);}

}
