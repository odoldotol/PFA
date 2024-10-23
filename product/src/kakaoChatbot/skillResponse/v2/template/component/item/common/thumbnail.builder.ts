import {
  Link,
  Thumbnail
} from "./thumbnail";

/**
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#thumbnail
 */
export class ThumbnailBuilder {

  private fixedRatio = false;
  private link: Link = {};

  constructor(
    private readonly imageUrl: string,
  ) {}

  public setFixedRatioTrue() {
    this.fixedRatio = true;
  }

  public setLinkWeb(linkWeb: string) {
    this.link.web = linkWeb;
  }

  public build(): Thumbnail {
    return new Thumbnail(
      this.imageUrl,
      this.link,
      this.fixedRatio,
    );
  }

}
