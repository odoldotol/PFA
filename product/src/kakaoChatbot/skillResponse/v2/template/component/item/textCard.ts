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

  constructor(
    public readonly title: string | undefined,
    public readonly description: string | undefined,
    public readonly buttons: Button[],
  ) {
    if (title === undefined && description === undefined) {
      throw new Error("title or description is required");
    }

    if (3 < buttons.length) {
      this.buttons = buttons.slice(0, 3);
    }
  }
}
