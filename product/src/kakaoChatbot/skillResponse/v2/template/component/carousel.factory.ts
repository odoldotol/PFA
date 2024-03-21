import { Item } from "./item";
import { CarouselComponent } from "./carousel";

export class CarouselComponentFactory {
  static create(item: Item<'carousel'>): CarouselComponent {
    return new CarouselComponent(item);
  }
}
