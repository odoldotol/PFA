import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KakaoCBService } from './kakao-chatbot.service';
import { KakaoChatbotGuard } from './guard/kakao-chatbot.guard';
import { SkillPayloadDto } from './dto/SkillPayload.dto';
import { SkillResponse } from './response/skill.response';
import { ApiCommonResponse } from 'src/common/decorator/apiCommonResponse.decorator';

@Controller('kakao-chatbot')
@UseGuards(KakaoChatbotGuard)
@ApiTags('Kakao Chatbot')
@ApiCommonResponse()
export class KakaoCBController {

  constructor(
    private readonly kakaoCBService: KakaoCBService,
  ) {}

  @Post('inquire')
  @HttpCode(200)
  @ApiOperation({ summary: '카카오 챗봇 스킬1' })
  @ApiOkResponse({ description: '카카오 챗봇 스킬1', type: SkillResponse })
  inquire(@Body() body: SkillPayloadDto) {
    return this.kakaoCBService.inquire(body);
  }

  // 유저 조회
  // 유저 추가

  // 구독 추가
  // 구독 삭제

  // 구독 자산 가격 조회

}
