import { ApiProperty } from "@nestjs/swagger";
import { LimitedArray } from "src/common/interface";
import { Button } from "./common";

/**
 * Skill TextCard Item
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#textcard
 * 
 * @property title ~50자
 * @property description 단일형 (title 과 합쳐서) ~400자, 케로셀 ~128자
 * @property buttons ~3개
 */
export class TextCard {

  @ApiProperty({
    type: "string",
    description: "최소, title, description 중 하나 필수"
  })
  readonly title?: string;

  @ApiProperty({
    type: "string",
    description: "최소, title, description 중 하나 필수"
  })
  readonly description?: string;

  @ApiProperty({
    type: [Button],
    maxItems: 3,
    minItems: 1,
    required: false
  })
  readonly buttons?: Buttons;

  constructor(
    textOptions: TextOptions,
    buttons?: Buttons
  ) {
    const { title, description } = textOptions;
    title && (this.title = title);
    description && (this.description = description);
    buttons && (this.buttons = buttons);
  }
}

type Buttons = Readonly<LimitedArray<Button, 3>>;

export type TextOptions = {
  title: string;
  description?: string;
} | {
  title?: string;
  description: string;
};