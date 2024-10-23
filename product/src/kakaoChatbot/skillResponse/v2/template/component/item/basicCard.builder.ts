import { BasicCard } from "./basicCard";
import {
  Button,
  ButtonFactory,
  Thumbnail
} from "./common";

abstract class BasicCardBuilderRoot {

  protected title: string | undefined;
  protected description: string | undefined;
  protected buttons: Button[] = [];

  public setTitle(title: string): this {
    this.title = title;
    return this;
  }

  public setDescription(description: string): this {
    this.description = description;
    return this;
  }

  /**
   * 3개 이상 버려짐
   */
  public addButton(
    ...params: Parameters<typeof ButtonFactory.create>
  ): this {
    this.buttons.push(ButtonFactory.create(...params));
    return this;
  }

  abstract setThumbnail(thumbnail: Thumbnail): ValidBasicCardItemBuilder;

}

export class BasicCardItemBuilder
  extends BasicCardBuilderRoot
{
  constructor() {
    super();
  }

  public setThumbnail(
    thumbnail: Thumbnail
  ): ValidBasicCardItemBuilder {
    return new ValidBasicCardItemBuilder(thumbnail);
  }

}

export class ValidBasicCardItemBuilder
  extends BasicCardBuilderRoot
{
  constructor(
    private thumbnail: Thumbnail
  ) {
    super();
    this.thumbnail = thumbnail;
  }

  public setThumbnail(thumbnail: Thumbnail): this {
    this.thumbnail = thumbnail;
    return this;
  }

  public buildItem(): BasicCard {
    return new BasicCard(
      this.title,
      this.description,
      this.thumbnail,
      this.buttons,
    );
  }

}
