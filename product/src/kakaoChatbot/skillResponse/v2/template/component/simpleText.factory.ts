import { Item } from "./item";
import { SimpleTextComponent } from "./simpleText";

export class SimpleTextComponentFactory {
  static create(item: Item<'simpleText'>): SimpleTextComponent {
    return new SimpleTextComponent(item);
  }
}
