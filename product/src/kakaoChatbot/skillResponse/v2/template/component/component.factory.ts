import { Component } from "./component";
import { factoryMap } from "./factory.map";
import { Item, ItemKey } from "./item";

export class ComponentFactory {

  static create<T extends ItemKey>(
    itemKey: T,
    item: Item<T>
  ): Component<T> {
    const factory = factoryMap.get(itemKey);
    if (!factory) {
      throw new Error("Factory not implemented");
    }
    return factory.create(item);
  }
}
