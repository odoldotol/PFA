import { ApiProperty } from "@nestjs/swagger";

/**
 * Ref: https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#skillresponse
 */
export abstract class SkillResponse {

  @ApiProperty()
  readonly version!: string;
  @ApiProperty()
  readonly template!: SkillTemplate;
  @ApiProperty()
  readonly context?: ContextControl;
  @ApiProperty()
  readonly data?: { [key: string]: any };
}

interface SkillTemplate {
  outputs: Component[]; // 1~3 개
  quickReplies?: QuickReply[]; // ~10 개
}

interface ContextControl {
  values: ContextValue;
}

interface QuickReply {
  label: string;
  action: "message" | "block";
  messageText?: string;
  blockId?: string; // action 이 block 일 경우 필수
  extra?: { [key: string]: any };
}

type Component = {
  simpleText?: SimpleText;
  textCard?: textCard;
};

interface SimpleText {
  text: string; // ~1000자
}

// interface SimpleImage {
//   imageUrl: string; // url
//   altText: string; // ~1000자
// }

interface textCard {
  title: string; // ~50자
  description: string; // 단일형 ~400자(title 에 따라 달라짐), 케로셀 ~128지
  buttons: Button[]; // ~3개
}

// interface BasicCard {
//   title: string; // ~2줄
//   description: string; // ~230자
//   thumbnail: Thumbnail;
//   buttons: Button[]; // ~3개
// }

// interface CommerceCard {}

// interface ListCard {}

// interface ItemCard {}

interface ContextValue {
  name: string; // 수정하려는 내보낼 컨텍스트 이름
  lifeSpan: number; // 내보낼 컨텍스트 lifeSpan
  params: { [key: string]: string }; // 내보낼 컨텍스트에 저장할 추가 데이터
}

export interface Button {
  label: string; // ~14자(가로배열 2개 ~8자), 썸네일이 1:1 이면 버튼 가로배열됨
  action: "webLink" | "message" | "phone" | "block" | "share" | "operator";
  webLinkUrl?: string; // url. action 이 webLink 일 경우 필수
  messageText?: string; // action 이 message || block 일 경우 필수
  phoneNumber?: string; // action 이 phone 일 경우 필수
  blockId?: string | undefined; // action 이 block 일 경우 필수
  extra?: { [key: string]: any };
}
