import {
  Carousel,
  CarouselCardKey,
} from "./carousel";

export class CarouselItemFactory {
  /**
   * items 일정 수 이상은 짤림 (LISTCARD ? 5 : 10)
   */
  static createItem<T extends CarouselCardKey = CarouselCardKey>(
    ...params: ConstructorParameters<typeof Carousel<T>>
  ): Carousel {
    return new Carousel(...params);
  }
}
