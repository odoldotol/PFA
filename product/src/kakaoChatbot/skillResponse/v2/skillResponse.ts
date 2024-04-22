import { ApiProperty } from "@nestjs/swagger";
import { SkillTemplate } from "./template";

export enum KakaoChatbotVersion {
  V2 = "2.0"
}

/**
 * ### Kakao chatbot skill response
 * Ref: https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#skillresponse
 */
export class SkillResponse {

  @ApiProperty({ default: KakaoChatbotVersion.V2 })
  public readonly version: KakaoChatbotVersion;

  @ApiProperty({ type: SkillTemplate, required: false})
  readonly template?: SkillTemplate;

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
    options: SkillResponseOptions
  ) {
    const {
      version,
      template,
      context,
      data
    } = options;

    this.version = version;
    template && (this.template = template);
    context && (this.context = context);
    data && (this.data = data);
  }
}

/**
 * ### ContextControl in SkillResponse
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#contextcontrol
 */
export type ContextControl = Readonly<{
  values: ContextValue[];
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

export type SkillResponseOptions = {
  version: KakaoChatbotVersion;
  template?: SkillTemplate;
  context?: ContextControl;
  data?: Data;
};