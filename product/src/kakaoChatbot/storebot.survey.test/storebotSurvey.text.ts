import { Injectable } from '@nestjs/common';
import { StorebotSurvey } from './storebotSurvey.schema';

@Injectable()
export class StorebotSurveyText {

  constructor() {}

  public eventSerial(
    survey: StorebotSurvey
  ): string {
    return `고객님의 쿠키가 맛있게 구워져있습니다!
아래 이벤트 번호를 태이 커피 로스터스에 보여주세요!
이벤트 번호: ${survey.userId}`;
  }

  public enterDescription(): string {
    return `카카오톡으로 태이 커피 로스터스에 주문과 결제를 할 수 있다면 이용하시겠어요?
우리 매장의 카카오톡 결제 서비스 개발을 시작하기 전에 실제 고객분들의 의견을 듣고 싶어요.
설문에 참여해 주시는 모든 분들께 태이 커피 로스터스에서 맛있는 쿠키를 드려요!`;
  }

  public noEventSerial(): string {
    return `앗, 아직 설문에 참여하지 않으셨네요!
지금 설문에 참여하고 맛있는 쿠키를 받아 가세요!`;
  }

  public alreadyDone(): string {
    return `앗, 설문을 다시 하시겠어요?
아니면 쿠키를 아직 받지 않으셨나요?`;
  }

  public continue(): string {
    return `이미 진행 중인 설문이 있어서 이어서 진행할게요!`;
  }

  public done(): string {
    return `설문에 참여해주셔서 감사해요!
혹시 질문에 잘못 대답하셨다면 설문은 언제든 다시 할 수 있어요!`;
  }

  public invalidAnswer(): string {
    return `죄송해요. 제가 답변을 이해할 수 없었어요. 설문조사에 참여하고 싶으신 거죠?`;
  }

}
