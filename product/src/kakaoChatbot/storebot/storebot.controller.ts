import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import {
  KakaoChatbotStorebotGuard,
  KakaoChatbotThrottlerGuard,
} from '../guard';
import { TimeoutInterceptor } from '../interceptor';
import {
  UnexpectedExceptionFilter,
  TimeoutExceptionFilter,
  BadRequestExceptionFilter,
  ForbiddenExceptionFilter,
} from '../filter';
import { StorebotService } from './storebot.service';
import { SkillResponse } from '../skillResponse/v2';
import { SkillPayloadDto } from '../dto';
import { throttleOptions } from '../const';

@Controller("storebot")
@Throttle(throttleOptions)
@UseGuards(
  KakaoChatbotStorebotGuard,
  KakaoChatbotThrottlerGuard
)
@UseInterceptors(TimeoutInterceptor)
@UseFilters(
  UnexpectedExceptionFilter, // 순서 주의 - 순서에 따라 달라질 수 있는거 나쁜 구성일까?
  TimeoutExceptionFilter,
  BadRequestExceptionFilter,
  ForbiddenExceptionFilter,
)
@ApiTags('Kakao Chatbot')
@ApiResponse({ status: "2XX", description: '카카오챗봇스킬 응답', type: SkillResponse })
export class StorebotController {

  constructor(
    private readonly storebotSrv: StorebotService,
  ) {}

  @Post("alarm/schedule/launch")
  @HttpCode(HttpStatus.OK)
  public scheduleLaunchAlarm(
    @Body() body: SkillPayloadDto,
  ): Promise<SkillResponse> {
    return this.storebotSrv.scheduleLaunchAlarm(body);
  }

}
