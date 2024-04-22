import { Component } from "./component";
import { SimpleTextItemFactory } from "./item";
import { SimpleTextComponent } from "./simpleText";

export class SimpleTextFactory
  extends SimpleTextItemFactory
{
  static createComponent(
    ...params: Parameters<typeof SimpleTextItemFactory.createItem>
  ): Component {
    return new SimpleTextComponent(this.createItem(...params));
  }
}
