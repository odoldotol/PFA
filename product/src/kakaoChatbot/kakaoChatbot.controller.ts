import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  Version
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from "express";
import {
  ApiResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { KakaoChatbotService } from './kakaoChatbot.service';
import {
  FriendOnlyGuard,
  KakaoChatbotGuard,
  KakaoChatbotThrottlerGuard
} from './guard';
import { TimeoutInterceptor } from './interceptor';
import {
  UnexpectedExceptionFilter,
  TimeoutExceptionFilter,
  BadRequestExceptionFilter,
  InvalidTickerExceptionFilter,
  NotFoundExceptionFilter,
  ForbiddenExceptionFilter,
  NotFriendExceptionFilter,
  ThrottlerExceptionFilter,
  InquireTimeoutExceptionFilter,
  BadIntentQueryExceptionFilter,
  TimeSensitiveQueryExceptionFilter,
  TooLongQueryExceptionFilter,
} from './filter';
import {
  AssetSubscriptionDto,
  InquireAssetDto,
  InquireAssetV2Dto,
  ReportTickerDto,
  SkillPayloadDto,
} from './dto';
import { SkillResponse } from './skillResponse/v2';
import { InvalidTickerException } from 'src/common/exception';
import {
  InvalidQueryException,
  TooLongQueryException
} from './exception';
import { apiMetadata } from './const';
import { getThrottleOptionsFromEnv } from 'src/throttler/getThrottleOptionsFromEnv';

// Todo: 아예 앤드포인트가 잘못되어 NotFound 일때 챗봇 응답이 없다
// => 당연하자나;

@Controller(apiMetadata.prefix)
@Throttle(getThrottleOptionsFromEnv('KAKAO_CHATBOT'))
@UseGuards(
  KakaoChatbotGuard,
  KakaoChatbotThrottlerGuard,
)
@UseInterceptors(TimeoutInterceptor)
@UseFilters(
  UnexpectedExceptionFilter, // 순서 주의 - 순서에 따라 달라질 수 있는거 나쁜 구성일까?
  ThrottlerExceptionFilter,
  TimeoutExceptionFilter,
  BadRequestExceptionFilter,
  ForbiddenExceptionFilter,
)
@ApiTags('Kakao Chatbot')
@ApiResponse({ status: "2XX", description: '카카오챗봇스킬 응답', type: SkillResponse })
export class KakaoChatbotController {

  constructor(
    private readonly kakaoChatbotSrv: KakaoChatbotService,
  ) {}

  @Post(apiMetadata.routes.inquireAsset.path)
  @HttpCode(HttpStatus.OK)
  @UseFilters(
    NotFoundExceptionFilter,
    InvalidTickerExceptionFilter,
  )
  @UsePipes(new ValidationPipe({
    transform: true,
    groups: ['ticker'],
    exceptionFactory: () => new InvalidTickerException()
  }))
  @ApiOperation({ summary: '카카오챗봇스킬: asset/inquire' })
  public inquireAsset(
    @Body() body: InquireAssetDto
  ): Promise<SkillResponse> {
    return this.kakaoChatbotSrv.inquireAsset(body);
  }

  /**
   * - 더 엄격한 쓰로틀링 적용  
   * (KakaoChatbotThrottlerGuard 는 다시 적용하지 않아도 되겠지?)  
   * 웹검색 이용하는 것만 따로 쓰로틀 거는것이 필요함.
   */
  @Post(apiMetadata.routes.inquireAsset_v2.path)
  @Version("2")
  @HttpCode(HttpStatus.OK)
  @Throttle(getThrottleOptionsFromEnv('KAKAO_CHATBOT_INQUIRE'))
  @UseFilters(
    NotFoundExceptionFilter,
    InquireTimeoutExceptionFilter,
    BadIntentQueryExceptionFilter,
    TimeSensitiveQueryExceptionFilter,
    TooLongQueryExceptionFilter,
  )
  @UsePipes(new ValidationPipe({
    transform: true,
    groups: ['query'],
    exceptionFactory: () => new InvalidQueryException()
  }))
  @UsePipes(new ValidationPipe({
    groups: ['query_long'],
    exceptionFactory: () => new TooLongQueryException()
  }))
  @ApiOperation({ summary: '카카오챗봇스킬: asset/inquire' })
  public inquireAsset_v2(
    @Body() body: InquireAssetV2Dto
  ): Promise<SkillResponse> {
    return this.kakaoChatbotSrv.inquireAsset_v2(body);
  }

  @Post(apiMetadata.routes.addAssetSubscription.path)
  @ApiOperation({ summary: '카카오챗봇스킬: asset-subscription/add' })
  public async addAssetSubscription(
    @Res() response: Response,
    @Body() body: AssetSubscriptionDto
  ): Promise<void> {
    const addAssetSubscriptionResult
    = await this.kakaoChatbotSrv.addAssetSubscription(body);

    if (addAssetSubscriptionResult.created) {
      response.status(HttpStatus.CREATED);
    } else {
      response.status(HttpStatus.OK);
    }

    response.json(addAssetSubscriptionResult.data);
  }

  @Post(apiMetadata.routes.cancelAssetSubscription.path)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '카카오챗봇스킬: asset-subscription/cancel' })
  public cancelAssetSubscription(
    @Body() body: AssetSubscriptionDto
  ): Promise<SkillResponse> {
    return this.kakaoChatbotSrv.cancelAssetSubscription(body);
  }

  @Post(apiMetadata.routes.inquireSubscribedAsset.path)
  @HttpCode(HttpStatus.OK)
  @UseGuards(FriendOnlyGuard)
  @UseFilters(NotFriendExceptionFilter)
  @ApiOperation({ summary: '카카오챗봇스킬: asset/subscriptions/inquire' })
  public inquireSubscribedAsset(
    @Body() body: SkillPayloadDto
  ): Promise<SkillResponse> {
    return this.kakaoChatbotSrv.inquireSubscribedAsset(body);
  }

  @Post(apiMetadata.routes.reportTicker.path)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '카카오챗봇스킬: report/ticker' })
  public reportTicker(
    @Body() body: ReportTickerDto
  ): Promise<SkillResponse> {
    return this.kakaoChatbotSrv.reportTicker(body);
  }

}

export type RouteName = keyof KakaoChatbotController;