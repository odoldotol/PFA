import {
  Button,
  Extra,
  Link,
  ListItemAction
} from "./common";

/**
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#listcard
 * 
 * items 5개 이상 무시
 * buttons 2개 이상 무시
 */
export class ListCard {
  constructor(
    public readonly header: ListItem,
    public readonly items: ListItem[],
    public readonly buttons: Button[],
  ) {
    if (5 < items.length) {
      this.items = items.slice(0, 5);
    }

    if (2 < buttons.length) {
      this.buttons = buttons.slice(0, 2);
    }
  }
}

/**
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#listitem_field_details
 */
export class ListItem {
  constructor(
    public readonly title: string,
    public readonly description: string | undefined,
    public readonly imageUrl: string | undefined,
    public readonly link: Link | undefined,
    public readonly action: ListItemAction | undefined,
    public readonly blockId: string | undefined,
    public readonly messageText: string | undefined,
    public readonly extra: Extra | undefined,
  ) {}
}

export class ListItemBuilder {

  private description: string | undefined;
  private imageUrl: string | undefined;
  private link: Link = {};
  private action: ListItemAction | undefined;
  private blockId: string | undefined;
  private messageText: string | undefined;
  private extra: Extra = {};

  constructor(
    private readonly title: string
  ) {}

  public setDescription(description: string): ListItemBuilder {
    this.description = description;
    return this;
  }

  public setImageUrl(imageUrl: string): ListItemBuilder {
    this.imageUrl = imageUrl;
    return this;
  }

  public setLinkWeb(url: string): ListItemBuilder {
    this.link.web = url;
    return this;
  }

  public setLinkMobile(url: string): ListItemBuilder {
    this.link.mobile = url;
    return this;
  }

  public setLinkPc(url: string): ListItemBuilder {
    this.link.pc = url;
    return this;
  }

  public setBlockAction(blockId: string): ListItemBuilder {
    this.action = ListItemAction.BLOCK;
    this.blockId = blockId;
    return this;
  }

  public setMessageAction(messageText: string): ListItemBuilder {
    this.action = ListItemAction.MESSAGE;
    this.messageText = messageText;
    return this;
  }

  /**
   * assign extra data
   */
  public addExtraData(data: Extra): ListItemBuilder {
    Object.assign(this.extra, data);
    return this;
  }

  public build(): ListItem {
    return new ListItem(
      this.title,
      this.description,
      this.imageUrl,
      this.link,
      this.action,
      this.blockId,
      this.messageText,
      this.extra
    )
  }

}
