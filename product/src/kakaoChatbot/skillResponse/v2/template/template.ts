import { ApiProperty } from "@nestjs/swagger";
import { Component } from "./component";

/**
 * ### SkillTemplate in SkillResponse
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#skilltemplate
 * 
 * - outputs 1개 이상 필수, 3개 초과 무시
 * - quickReplies 10개 초과 무시
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
  public readonly outputs: Component[];

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
  public readonly quickReplies: QuickReply[];

  constructor(
    outputs: Component[],
    quickReplies: QuickReply[]
  ) {
    this.outputs = outputs.slice(0, 3);
    this.quickReplies = quickReplies.slice(0, 10);
  }
}

/**
 * @todo QuickReply Creation
 */
export type QuickReply = Readonly<{
  label: string;
  action: "message" | "block";
  messageText?: string; // 사용자측으로 노출될 발화
  blockId?: string; // action 이 block 일 경우 필수
  extra?: { [key: string]: any };
}>;