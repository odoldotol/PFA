import {
  Carousel,
  CarouselCardKey,
  CarouselHeader,
  Items
} from "./carousel";

// Todo: Builder 로 전환하고 item 을 addItem 매서드로 추가
export const carouselFactory
= <T extends CarouselCardKey = CarouselCardKey>(
  type: T,
  items: Items<T>,
  header?: CarouselHeader
): Carousel => {
  return new Carousel(type, items, header);
};