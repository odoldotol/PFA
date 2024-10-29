import { BasicCard } from "./basicCard";
import {
  Button,
  ButtonFactory,
  Thumbnail
} from "./common";

class BasicCardData {
  public title: string | undefined;
  public description: string | undefined;
  public thumbnail: Thumbnail | undefined;
  public buttons: Button[] = [];
}

abstract class BasicCardBuilderRoot {

  constructor(
    protected readonly data: BasicCardData
  ) {}

  public setTitle(title: string): this {
    this.data.title = title;
    return this;
  }

  public setDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  /**
   * 3개 초과 버려짐
   */
  public addButton(
    ...params: Parameters<typeof ButtonFactory.create>
  ): this {
    this.data.buttons.push(ButtonFactory.create(...params));
    return this;
  }

  abstract setThumbnail(thumbnail: Thumbnail): ValidBasicCardItemBuilder;

}

/**
 * setThumbnail 을 통해 buildItem 을 얻을 수 있음.
 */
export class BasicCardItemBuilder
  extends BasicCardBuilderRoot
{
  constructor() {
    super(new BasicCardData());
  }

  public setThumbnail(
    thumbnail: Thumbnail
  ): ValidBasicCardItemBuilder {
    this.data.thumbnail = thumbnail;
    return new ValidBasicCardItemBuilder(this.data);
  }

}

export class ValidBasicCardItemBuilder
  extends BasicCardBuilderRoot
{
  constructor(data: BasicCardData) {
    super(data);
  }

  public setThumbnail(thumbnail: Thumbnail): this {
    this.data.thumbnail = thumbnail;
    return this;
  }

  public buildItem(): BasicCard {
    return new BasicCard(
      this.data.title,
      this.data.description,
      this.data.thumbnail!,
      this.data.buttons,
    );
  }

}
