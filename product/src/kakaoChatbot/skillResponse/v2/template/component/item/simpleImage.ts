/**
 * Skill SimpleImage Item
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#simpleimage
 * 
 * @property imageUrl url 형식
 * @property altText ~1000자
 * 
 */
export class SimpleImage {

  constructor(
    public readonly imageUrl: string,
    public readonly altText: string,
  ) {}
}
