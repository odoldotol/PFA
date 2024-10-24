import { Label } from "./button";
import { blockButton, BlockId } from "./block";
import { ButtonChildFactory } from "./button.factory";
import { Extra } from "../extra";

/**
 * @todo MessageText 를 가지는 blockButton 생성
 */
export const blockButtonFactory: ButtonChildFactory = (
  label: Label,
  blockId: BlockId,
  extra?: Extra
): blockButton => {
  return new blockButton(label, blockId, extra);
};