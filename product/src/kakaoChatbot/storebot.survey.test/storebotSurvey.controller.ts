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
import {
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import {
  KakaoChatbotStorebotGuard,
} from '../guard';
import { TimeoutInterceptor } from '../interceptor';
import {
  UnexpectedExceptionFilter,
  TimeoutExceptionFilter,
  BadRequestExceptionFilter,
  ForbiddenExceptionFilter,
} from '../filter';
import { StorebotSurveyTestService } from './storebotSurvey.service';
import { SkillResponse } from '../skillResponse/v2';
import { SkillPayloadDto } from '../dto';

@Controller("storebot_survey_test")
@UseGuards(KakaoChatbotStorebotGuard)
@UseInterceptors(TimeoutInterceptor)
@UseFilters(
  UnexpectedExceptionFilter, // 순서 주의 - 순서에 따라 달라질 수 있는거 나쁜 구성일까?
  TimeoutExceptionFilter,
  BadRequestExceptionFilter,
  ForbiddenExceptionFilter,
)
@ApiTags('Kakao Chatbot')
@ApiResponse({ status: "2XX", description: '카카오챗봇스킬 응답', type: SkillResponse })
export class StorebotSurveyTestController {

  constructor(
    private readonly storebotSurveyTestSrv: StorebotSurveyTestService,
  ) {}

  @Post("get_event_serial")
  @HttpCode(HttpStatus.OK)
  public getEventSerial(
    @Body() body: SkillPayloadDto,
  ) {
    return this.storebotSurveyTestSrv.getEventSerial(body);
  }

  @Post("volunteer")
  @HttpCode(HttpStatus.OK)
  public volunteer(
    @Body() body: SkillPayloadDto,
  ) {
    return this.storebotSurveyTestSrv.volunteer(body);
  }

  @Post("enter")
  @HttpCode(HttpStatus.OK)
  public enter(
    @Body() _body: SkillPayloadDto,
  ) {
    return this.storebotSurveyTestSrv.enter();
  }

  @Post("start")
  @HttpCode(HttpStatus.OK)
  public start(
    @Body() body: SkillPayloadDto,
  ) {
    return this.storebotSurveyTestSrv.start(body);
  }

  @Post("answer/:questionNumber")
  @HttpCode(HttpStatus.OK)
  public answer(
    @Body() body: SkillPayloadDto,
  ) {
    return this.storebotSurveyTestSrv.answerQuestion(body);
  }

}
