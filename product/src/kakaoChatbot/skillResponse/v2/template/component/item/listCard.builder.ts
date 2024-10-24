import {
  Button,
  ButtonFactory
} from "./common";
import {
  ListCard,
  ListItem,
  ListItemBuilder
} from "./listCard";

class ListCardData {
  public items: ListItem[] = [];
  public buttons: Button[] = [];

  constructor (
    public header: ListItem
  ) {}
}

/**
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#listcard
 */
abstract class ListCardBuilderRoot {

  constructor(
    protected data: ListCardData
  ) {}

  /**
   * 5개 이상 무시됨
   */
  public abstract addItem(item: ListItem): ValidListCardItemBuilder;

  /**
   * 2개 이상 무시됨
   */
  public addButton(
    ...params: Parameters<typeof ButtonFactory.create>
  ): this {
    this.data.buttons.push(ButtonFactory.create(...params));
    return this;
  }

}

/**
 * addItem 을 통해 buildItem 을 얻을 수 있음.  
 */
export class ListCardItemBuilder
  extends ListCardBuilderRoot
{
  constructor(
    title: string
  ) {
    super(new ListCardData(
      new ListItemBuilder(title).build()
    ));
  }

  public addItem(
    item: ListItem
  ): ValidListCardItemBuilder {
    this.data.items.push(item);
    return new ValidListCardItemBuilder(this.data);
  }

}

export class ValidListCardItemBuilder
  extends ListCardBuilderRoot
{
  constructor(data: ListCardData) {
    super(data);
  }

  public addItem(
    item: ListItem
  ): this {
    this.data.items.push(item);
    return this;
  }

  public buildItem(): ListCard {
    return new ListCard(
      this.data.header,
      this.data.items,
      this.data.buttons
    );
  }

}
