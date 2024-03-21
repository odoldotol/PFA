import {
  Carousel,
  CarouselCardKey,
  CarouselHeader,
  Items
} from "./carousel";

export class CarouselFactory {
  static create<T extends CarouselCardKey = CarouselCardKey>(
    type: T,
    items: Items<T>,
    header?: CarouselHeader
  ): Carousel {
    return new Carousel(type, items, header);
  }
}
