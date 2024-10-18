import {
  CardKey,
  CarouselItemFactory
} from "./item";
import { CarouselComponent } from "./carousel";
import { Component } from "./component";

export class CarouselFactory
  extends CarouselItemFactory
{
  /**
   * items 일정 수 이상은 짤림 (LISTCARD ? 5 : 10)
   */
  static createComponent<T extends CardKey = CardKey>(
    ...params: Parameters<typeof CarouselItemFactory.createItem<T>>
  ): Component {
    return new CarouselComponent(this.createItem(...params));
  }
}
