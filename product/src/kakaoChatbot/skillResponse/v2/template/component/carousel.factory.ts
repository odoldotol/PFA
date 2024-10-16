import { CarouselItemFactory } from "./item";
import { CarouselComponent } from "./carousel";
import { Component } from "./component";
import { CarouselCardKey } from "./item/carousel";

export class CarouselFactory
  extends CarouselItemFactory
{
  /**
   * items 일정 수 이상은 짤림 (LISTCARD ? 5 : 10)
   */
  static createComponent<T extends CarouselCardKey = CarouselCardKey>(
    ...params: Parameters<typeof CarouselItemFactory.createItem<T>>
  ): Component {
    return new CarouselComponent(this.createItem(...params));
  }
}
