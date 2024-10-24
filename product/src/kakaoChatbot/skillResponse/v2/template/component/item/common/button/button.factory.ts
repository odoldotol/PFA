import { ButtonAction } from "../action";
import { Extra } from "../extra";
import { BlockId } from "./block";
import { blockButtonFactory } from "./block.factory";
import { Button, Label } from "./button";
import { WebLinkUrl } from "./webLink";
import { webLinkButtonFactory } from "./webLink.factory";

export class ButtonFactory {

  private static factoryMap: Map<ButtonAction, ButtonChildFactory>
  = new Map([
    [ButtonAction.WEBLINK, webLinkButtonFactory],
    [ButtonAction.BLOCK, blockButtonFactory]
  ]);

  static create<A extends ButtonAction>(
    label: Label,
    action: A,
    option: ButtonOption<A>,
    extra?: Extra
  ): Button {
    const factory = this.factoryMap.get(action);
    if (!factory) {
      throw new Error("Factory not implemented");
    }
    return factory(label, option, extra);
  }
}

export type ButtonOption<A extends ButtonAction = ButtonAction>
= A extends ButtonAction.WEBLINK ? WebLinkUrl
// : A extends ButtonAction.MESSAGE ? MessageText
// : A extends ButtonAction.PHONE ? PhoneNumber
: A extends ButtonAction.BLOCK ? BlockId
: never;

export interface ButtonChildFactory {
  // (label: Label, extra?: Extra): Button;
  (label: Label, option: ButtonOption, extra?: Extra): Button;
  // (label: Label, option: ButtonOption, option2?: ButtonOption, extra?: Extra): Button;
}