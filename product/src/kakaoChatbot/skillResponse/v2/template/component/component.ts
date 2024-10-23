import { OnlyOneOf } from "src/common/util";
import {
  SimpleText,
  TextCard,
  Carousel,
  SimpleImage,
  BasicCard
} from "./item";

export type Component = OnlyOneOf<{
  readonly simpleText: SimpleText;
  readonly simpleImage: SimpleImage;
  readonly textCard: TextCard;
  readonly basicCard: BasicCard;
  // commerceCard
  // listCard
  // itemCard
  readonly carousel: Carousel;
}>;