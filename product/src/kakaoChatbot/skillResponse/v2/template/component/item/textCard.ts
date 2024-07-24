import { LimitedArray } from "src/common/util";
import { Button } from "./common";

/**
 * Skill TextCard Item
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#textcard
 * 
 * title, description 중 하나 필수
 * 
 * @property title ~50자
 * @property description 단일형 (title 과 합쳐서) ~400자, 케로셀 ~128자
 * @property buttons ~3개
 */
export class TextCard {

  readonly title?: string;
  readonly description?: string;
  readonly buttons?: Buttons;

  constructor(
    textOptions: TextOptions,
    buttons?: Buttons
  ) {
    if ("title" in textOptions && textOptions.title !== undefined) {
      this.title = textOptions.title;
    }

    if ("description" in textOptions && textOptions.description !== undefined) {
      this.description = textOptions.description;
    }

    buttons && (this.buttons = buttons);
  }
}

export type Buttons = Readonly<LimitedArray<Button, 3>>;

export type TextOptions = {
  title: string;
  description?: string;
} | {
  title?: string;
  description: string;
};