import { carouselFactory } from "./item";
import { CarouselComponent } from "./carousel";
import { Component } from "./component";

// Todo: Builder 로 전환하고 item 을 addItem 매서드로 추가
export const carouselComponentFactory = (
  ...params: Parameters<typeof carouselFactory>
): Component => {
  return new CarouselComponent(carouselFactory(...params));
}
