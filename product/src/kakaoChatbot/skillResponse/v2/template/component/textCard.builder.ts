import { Component } from "./component";
import { TextCardItemBuilder, ValidTextCardItemBuilder } from "./item";
import { TextCardComponent } from "./textCard";

export class TextCardBuilder
  extends TextCardItemBuilder
{
  public override setTitle(title: string): ValidTextCardBuilder {
    super.setTitle(title);
    return new ValidTextCardBuilder(this.data);
  }

  public override setDescription(description: string): ValidTextCardBuilder {
    super.setDescription(description);
    return new ValidTextCardBuilder(this.data);
  }
}

export class ValidTextCardBuilder
  extends ValidTextCardItemBuilder
{
  public buildComponent(): Component {
    return new TextCardComponent(this.buildItem());
  }
}
