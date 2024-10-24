import { Link } from "./link";

/**
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#thumbnail
 */
export class Thumbnail {

  constructor(
    public readonly imageUrl: string,
    public readonly link: Link,
    public readonly fixedRatio: boolean,
  ) {}
}
