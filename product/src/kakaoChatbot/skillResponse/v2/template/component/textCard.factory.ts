import { Item } from "./item";
import { TextCardComponent } from "./textCard";

export class TextCardComponentFactory {
  static create(item: Item<'textCard'>): TextCardComponent {
    return new TextCardComponent(item);
  }
}
