import { SimpleText } from "./simpleText";

export class SimpleTextItemFactory {
  static createItem(text: string): SimpleText {
    return new SimpleText(text);
  }
}
