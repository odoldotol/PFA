import { SimpleImage } from "./simpleImage";

export class SimpleImageItemFactory {
  static createItem(
    ...param: ConstructorParameters<typeof SimpleImage>
  ): SimpleImage {
    return new SimpleImage(...param);
  }
}
