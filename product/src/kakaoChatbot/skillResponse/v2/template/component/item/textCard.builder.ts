import { ButtonFactory } from "./common";
import { Buttons, TextCard, TextOptions } from "./textCard";

class TextCardBuilderData {
  public buttons?: Buttons;
}

abstract class TextCardBuilderRoot {
  constructor(
    protected readonly data: TextCardBuilderData,
  ) {}

  /**
   * 3개 초과 추가 부터는 무시됨
   */
  public addButton(
    ...params: Parameters<typeof ButtonFactory.create>
  ): this {
    const button = () => ButtonFactory.create(...params);

    if (!this.data.buttons) {
      this.data.buttons = [button()];
    } else if (this.data.buttons.length < 3) {
      this.data.buttons.push(button());
    }

    return this;
  }

  abstract setTitle(title: string): ValidTextCardItemBuilder;
  abstract setDescription(description: string): ValidTextCardItemBuilder;
}

/**
 * title 또는 description 중 하나 필수
 */
export class TextCardItemBuilder
  extends TextCardBuilderRoot
{
  constructor() {
    super(new TextCardBuilderData());
  }

  public setTitle(title: string): ValidTextCardItemBuilder {
    return new ValidTextCardItemBuilder(this.data, { title });
  }

  public setDescription(description: string): ValidTextCardItemBuilder {
    return new ValidTextCardItemBuilder(this.data, { description });
  }
}


export class ValidTextCardItemBuilder
  extends TextCardBuilderRoot
{
  constructor(
    data: TextCardBuilderData,
    protected textOptions: TextOptions,
  ) {
    super(data);
  }

  public setTitle(title: string): this {
    this.textOptions.title = title;
    return this;
  }

  public setDescription(description: string): this {
    this.textOptions.description = description;
    return this;
  }

  public buildItem(): TextCard {
    return new TextCard(
      this.textOptions,
      this.data.buttons
    );
  }
}
