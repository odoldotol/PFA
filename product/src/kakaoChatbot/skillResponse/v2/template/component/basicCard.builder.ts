import { BasicCardComponent } from "./basicCard";
import { Component } from "./component";
import {
  BasicCardItemBuilder,
  Thumbnail,
  ValidBasicCardItemBuilder
} from "./item";

export class BasicCardBuilder
  extends BasicCardItemBuilder
{
  public override setThumbnail(
    thumbnail: Thumbnail
  ): ValidBasicCardBuilder {
    super.setThumbnail(thumbnail);
    return new ValidBasicCardBuilder(this.data);
  }
}

export class ValidBasicCardBuilder
  extends ValidBasicCardItemBuilder
{
  public buildComponent(): Component {
    return new BasicCardComponent(this.buildItem());
  }
}
