import {
  Body,
  Controller,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KakaoChatbotService } from './kakaoChatbot.service';
import { KakaoChatbotGuard } from './guard/kakao-chatbot.guard';
import { TimeoutInterceptor } from './interceptor/timeout.interceptor';
import { TimeoutExceptionFilter } from './filter/timeoutException.filter';
import { UnexpectedExceptionFilter } from './filter/UnexpectedException.filter';
import { SkillPayloadDto } from './dto/SkillPayload.dto';
import { SkillResponse } from './response/skill.response';
import { ApiCommonResponse } from 'src/common/decorator/apiCommonResponse.decorator';

@Controller('kakao-chatbot')
@UseGuards(KakaoChatbotGuard)
@UseInterceptors(TimeoutInterceptor)
@UseFilters(
  UnexpectedExceptionFilter, // 순서 주의 - 순서에 따라 달라질 수 있는거 나쁜 구성일까?
  TimeoutExceptionFilter,
)
@ApiTags('Kakao Chatbot')
@ApiCommonResponse()
export class KakaoChatbotController {

  constructor(
    private readonly kakaoChatbotSrv: KakaoChatbotService,
  ) {}

  @Post('asset/inquire')
  @ApiOperation({ summary: '카카오챗봇스킬: asset/inquire' })
  @ApiOkResponse({ description: '카카오챗봇스킬 응답', type: SkillResponse })
  inquire(
    @Body() body: SkillPayloadDto
  ): Promise<SkillResponse> {
    return this.kakaoChatbotSrv.inquireAsset(body);
  }

  @Post('asset-subscription/add')
  @ApiOperation({ summary: '카카오챗봇스킬: asset-subscription/add' })
  @ApiOkResponse({ description: '카카오챗봇스킬 응답', type: SkillResponse })
  addAssetSubscription(
    @Body() body: SkillPayloadDto
  ): Promise<SkillResponse> {
    return this.kakaoChatbotSrv.subscribeAsset(body);
  }

  @Post('asset-subscription/cancel')
  @ApiOperation({ summary: '카카오챗봇스킬: asset-subscription/cancel' })
  @ApiOkResponse({ description: '카카오챗봇스킬 응답', type: SkillResponse })
  cancelAssetSubscription(
    @Body() body: SkillPayloadDto
  ): Promise<SkillResponse> {
    return this.kakaoChatbotSrv.cancelAssetSubscription(body);
  }

  @Post('asset/subscriptions/inquire')
  @ApiOperation({ summary: '카카오챗봇스킬: asset/subscriptions/inquire' })
  @ApiOkResponse({ description: '카카오챗봇스킬 응답', type: SkillResponse })
  getAssetSubscriptions(
    @Body() body: SkillPayloadDto
  ): Promise<SkillResponse> {
    return this.kakaoChatbotSrv.inquireSubscribedAsset(body);
  }

  @Post('report')
  @ApiOperation({ summary: '카카오챗봇스킬: report' })
  @ApiOkResponse({ description: '카카오챗봇스킬 응답', type: SkillResponse })
  report(
    @Body() body: SkillPayloadDto
  ): Promise<SkillResponse> {
    return this.kakaoChatbotSrv.report(body);
  }

}
