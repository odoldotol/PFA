import { Component } from "./component";
import { TextCardItemBuilder, ValidTextCardItemBuilder } from "./item";
import { TextCardComponent } from "./textCard";

export class TextCardBuilder
  extends TextCardItemBuilder
{
  public override setTitle(title: string): ValidTextCardBuilder {
    return new ValidTextCardBuilder(this.data, { title });
  }

  public override setDescription(description: string): ValidTextCardBuilder {
    return new ValidTextCardBuilder(this.data, { description });
  }
}

class ValidTextCardBuilder
  extends ValidTextCardItemBuilder
{
  public buildComponent(): Component {
    return new TextCardComponent(this.buildItem());
  }
}
