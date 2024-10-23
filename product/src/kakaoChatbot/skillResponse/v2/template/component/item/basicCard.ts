import { Button } from "./common";
import { Thumbnail } from "./common/thumbnail";

/**
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#basiccard
 * 
 * button 3개 까지만 처리함
 */
export class BasicCard {

  constructor(
    public readonly title: string | undefined,
    public readonly description: string | undefined,
    public readonly thumbnail: Thumbnail,
    public readonly buttons: Button[],
  ) {
    this.buttons = this.buttons.slice(0, 3);
  }

}
