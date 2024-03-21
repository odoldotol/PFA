import { Item, ItemKey } from "./item";
import { Component } from "./component";
import { SimpleTextComponentFactory } from "./simpleText.factory";
import { TextCardComponentFactory } from "./textCard.factory";
import { CarouselComponentFactory } from "./carousel.factory";

export const factoryMap
: Map<ItemKey, ComponentFactory>
= new Map();

factoryMap.set('simpleText', SimpleTextComponentFactory);
factoryMap.set('textCard', TextCardComponentFactory);
factoryMap.set('carousel', CarouselComponentFactory);


interface ComponentFactory<T extends ItemKey = ItemKey> {
  create(item: Item<T>): Component<T>;
}
