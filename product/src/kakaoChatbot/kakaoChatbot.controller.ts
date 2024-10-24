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
  ValidationPipe
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
} from './filter';
import {
  AssetSubscriptionDto,
  InquireAssetDto,
  ReportTickerDto,
  SkillPayloadDto,
} from './dto';
import { SkillResponse } from './skillResponse/v2';
import { InvalidTickerException } from 'src/common/exception';
import {
  apiMetadata,
  throttleOptions
} from './const';

@Controller(apiMetadata.prefix)
@Throttle(throttleOptions)
@UseGuards(
  KakaoChatbotGuard,
  KakaoChatbotThrottlerGuard,
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