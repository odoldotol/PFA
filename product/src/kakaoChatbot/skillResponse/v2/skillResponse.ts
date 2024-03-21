import { ApiProperty } from "@nestjs/swagger";
import { ItemKey, SkillTemplate } from "./template";

const KAKAO_CHATBOT_VERSION = "2.0";

/**
 * ### Kakao chatbot skill response
 * Ref: https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#skillresponse
 */
export class SkillResponse<
T1 extends ItemKey | null = ItemKey | null,
T2 extends (T1 extends ItemKey ? (ItemKey | null) : null) = null,
T3 extends (T2 extends ItemKey ? (ItemKey | null) : null) = null
> {
  @ApiProperty({ default: KAKAO_CHATBOT_VERSION })
  readonly version = KAKAO_CHATBOT_VERSION;

  @ApiProperty({ type: SkillTemplate, required: false})
  readonly template?: Template<T1, T2, T3>;

  @ApiProperty({
    type: "object",
    properties: {
      values: {
        type: "object",
        properties: {
          name: { type: "string" },
          lifeSpan: { type: "number" },
          params: {
            type: "object",
            additionalProperties: { type: "string" }
          }
        }
      }
    },
    required: false
  })
  readonly context?: ContextControl;

  @ApiProperty({
    type: "object",
    additionalProperties: { type: "any" },
    required: false
  })
  readonly data?: Data;

  constructor(
    options?: SkillResponseOptions<Template<T1, T2, T3>>
  ) {
    const {
      // version,
      template,
      context,
      data
    } = options || {};
    this.version = /*version || */KAKAO_CHATBOT_VERSION;
    template && (this.template = template);
    context && (this.context = context);
    data && (this.data = data);
  }
}

export type Template<
T1 extends ItemKey | null,
T2 extends (T1 extends ItemKey ? (ItemKey | null) : null),
T3 extends (T2 extends ItemKey ? (ItemKey | null) : null)
> = T1 extends ItemKey ? SkillTemplate<T1, T2, T3> : never;

/**
 * ### ContextControl in SkillResponse
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#contextcontrol
 */
type ContextControl = Readonly<{
  values: ContextValue;
}>;

type ContextValue = Readonly<{
  name: string; // 수정하려는 내보낼 컨텍스트 이름
  lifeSpan: number; // 내보낼 컨텍스트 lifeSpan
  params: { [key: string]: string }; // 내보낼 컨텍스트에 저장할 추가 데이터
}>;

/**
 * ### Data in SkillResponse
 */
export type Data = Readonly<{
  [key: string]: any;
}>;

export type SkillResponseOptions<T>
= {
  // version?: string;
  template?: T;
  context?: ContextControl;
  data?: Data;
};