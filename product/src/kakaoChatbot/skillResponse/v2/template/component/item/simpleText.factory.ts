import { SimpleText } from "./simpleText";

export class SimpleTextFactory {
  static create(text: string): SimpleText {
    return new SimpleText(text);
  }
}
