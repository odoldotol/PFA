import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KakaoChatbotService } from './kakaoChatbot.service';
import { KakaoChatbotGuard } from './guard/kakao-chatbot.guard';
import { SkillPayloadDto } from './dto/SkillPayload.dto';
import { SkillResponse } from './response/skill.response';
import { ApiCommonResponse } from 'src/common/decorator/apiCommonResponse.decorator';

@Controller('kakao-chatbot')
@UseGuards(KakaoChatbotGuard)
@ApiTags('Kakao Chatbot')
@ApiCommonResponse()
export class KakaoChatbotController {

  constructor(
    private readonly kakaoChatbotSrv: KakaoChatbotService,
  ) {}

  @Post('inquire')
  @HttpCode(200)
  @ApiOperation({ summary: '카카오 챗봇 스킬1' })
  @ApiOkResponse({ description: '카카오 챗봇 스킬1', type: SkillResponse })
  inquire(
    @Body() body: SkillPayloadDto
  ): Promise<SkillResponse> {
    return this.kakaoChatbotSrv.inquire(body);
  }

  @Post('asset-subscription/add')
  @ApiOperation({ summary: 'Asset 구독 추가' })
  addAssetSubscription(
    @Body() body: SkillPayloadDto
  ): Promise<SkillResponse> {
    return this.kakaoChatbotSrv.subscribeAsset(body);
  }

  @Post('asset-subscription/cancel')
  @ApiOperation({ summary: 'Asset 구독 취소' })
  cancelAssetSubscription(
    @Body() body: SkillPayloadDto
  ): Promise<SkillResponse> {
    return this.kakaoChatbotSrv.cancelAssetSubscription(body);
  }

  @Post('asset/subscriptions/get')
  @ApiOperation({ summary: '구독 자산 조회' })
  getAssetSubscriptions(
    @Body() body: SkillPayloadDto
  ): Promise<SkillResponse> {
    return this.kakaoChatbotSrv.getAssetSubscriptions(body);
  }

}
