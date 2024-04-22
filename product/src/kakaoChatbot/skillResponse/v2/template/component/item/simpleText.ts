/**
 * Skill SimpleText Item
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#simpletext
 * 
 * @property text ~1000자
 * 
 */
export class SimpleText {

  constructor(
    public readonly text: string
  ) {}
}
