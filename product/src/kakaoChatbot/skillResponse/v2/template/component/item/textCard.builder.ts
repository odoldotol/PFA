import { Button, ButtonFactory } from "./common";
import { TextCard } from "./textCard";

class TextCardData {
  public title: string | undefined;
  public description: string | undefined;
  public buttons: Button[] = [];
}

abstract class TextCardBuilderRoot {
  constructor(
    protected readonly data: TextCardData,
  ) {}

  /**
   * 3개 초과 추가 부터는 무시됨
   */
  public addButton(
    ...params: Parameters<typeof ButtonFactory.create>
  ): this {
    this.data.buttons.push(ButtonFactory.create(...params));
    return this;
  }

  abstract setTitle(title: string): ValidTextCardItemBuilder;
  abstract setDescription(description: string): ValidTextCardItemBuilder;

}

/**
 * title 또는 description 중 하나 필수  
 * setTitle 또는 setDescription 를 통해 buildItem 을 얻을 수 있음.
 */
export class TextCardItemBuilder
  extends TextCardBuilderRoot
{
  constructor() {
    super(new TextCardData());
  }

  public setTitle(title: string): ValidTextCardItemBuilder {
    this.data.title = title;
    return new ValidTextCardItemBuilder(this.data);
  }

  public setDescription(description: string): ValidTextCardItemBuilder {
    this.data.description = description;
    return new ValidTextCardItemBuilder(this.data);
  }

}

export class ValidTextCardItemBuilder
  extends TextCardBuilderRoot
{
  constructor(data: TextCardData) {
    super(data);
  }

  public setTitle(title: string): this {
    this.data.title = title;
    return this;
  }

  public setDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  public buildItem(): TextCard {
    return new TextCard(
      this.data.title,
      this.data.description,
      this.data.buttons
    );
  }

}
