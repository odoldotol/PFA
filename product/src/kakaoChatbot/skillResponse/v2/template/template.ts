import { ApiProperty } from "@nestjs/swagger";
import { LimitedArray } from "src/common/interface";
import { Component } from "./component";

/**
 * ### SkillTemplate in SkillResponse
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#skilltemplate
 */
export class SkillTemplate {

  @ApiProperty({
    type: "array",
    items: {
      type: "object",
      properties: {
        itemKey: { type: "Item" },
      }
    },
    minItems: 1,
    maxItems: 3
  })
  readonly outputs: Outputs;

  @ApiProperty({
    type: "array",
    items: {
      type: "object",
      properties: {
        label: { type: "string" },
        action: { type: "string", enum: ["message", "block"] },
        messageText: { type: "string" },
        blockId: { type: "string" },
        extra: { type: "object" }
      }
    },
    minItems: 1,
    maxItems: 10,
    required: false
  })
  readonly quickReplies?: QuickReplies;

  constructor(
    outputs: Outputs,
    quickReplies?: QuickReplies
  ) {
    this.outputs = outputs;
    quickReplies && (this.quickReplies = quickReplies);
  }
}

export type Outputs = Readonly<LimitedArray<Component, 3>>;

export type QuickReplies = Readonly<LimitedArray<QuickReply, 10>>;

type QuickReply = Readonly<{
  label: string;
  action: "message" | "block";
  messageText?: string; // 사용자측으로 노출될 발화
  blockId?: string; // action 이 block 일 경우 필수
  extra?: { [key: string]: any };
}>;