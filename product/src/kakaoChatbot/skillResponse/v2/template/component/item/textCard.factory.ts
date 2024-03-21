import { LimitedArray, isLimitedArray } from "src/common/interface";
import { ButtonFactory } from "./common";
import { TextCard, TextOptions } from "./textCard";

export class TextCardFactory {
  static create(
    textOptions: TextOptions,
    buttonsParameters?: Readonly<LimitedArray<Parameters<typeof ButtonFactory.create>, 3>>
  ): TextCard {

    const buttons = buttonsParameters?.map(params => {
      return ButtonFactory.create(...params)
    });

    if (buttons && isLimitedArray(buttons, 3)) {
      return new TextCard(
        textOptions,
        buttons
      );
    } else {
      return new TextCard(textOptions);
    }
  }
}
