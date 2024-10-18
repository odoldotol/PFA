import { Carousel } from "./carousel";
import { CardKey } from "./item";

export class CarouselItemFactory {
  /**
   * items 일정 수 이상은 짤림 (LISTCARD ? 5 : 10)
   */
  static createItem<T extends CardKey = CardKey>(
    ...params: ConstructorParameters<typeof Carousel<T>>
  ): Carousel {
    return new Carousel(...params);
  }
}
