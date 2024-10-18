import { Component } from "./component";
import { SimpleImageItemFactory } from "./item";
import { SimpleImageComponent } from "./simpleImage";

export class SimpleImageFactory
  extends SimpleImageItemFactory
{
  static createComponent(
    ...params: Parameters<typeof SimpleImageItemFactory.createItem>
  ): Component {
    return new SimpleImageComponent(this.createItem(...params));
  }
}
