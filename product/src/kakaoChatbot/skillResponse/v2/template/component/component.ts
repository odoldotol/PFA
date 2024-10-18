import { OnlyOneOf } from "src/common/util";
import {
  SimpleText,
  TextCard,
  Carousel,
  SimpleImage
} from "./item";

export type Component = OnlyOneOf<{
  readonly simpleText: SimpleText;
  readonly simpleImage: SimpleImage;
  readonly textCard: TextCard;
  // basicCard
  // commerceCard
  // listCard
  // itemCard
  readonly carousel: Carousel;
}>;