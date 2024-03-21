import { Button, ButtonAction } from "./button";
import { factoryMap } from "./factory.map";

export class ButtonFactory {

  static create(
    label: string,
    action: ButtonAction,
    option: string,
    extra?: any
  ): Button {
    const factory = factoryMap.get(action);
    if (!factory) {
      throw new Error("Factory not implemented");
    }
    return factory.create(label, option, extra);
  }
}
