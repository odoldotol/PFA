import { OnlyOneOf } from "src/common/interface";
import {
  SimpleText,
  TextCard,
  Carousel
} from "./item";

export type Component = OnlyOneOf<{
  readonly simpleText: SimpleText;
  // simpleImage
  readonly textCard: TextCard;
  // basicCard
  // commerceCard
  // listCard
  // itemCard
  readonly carousel: Carousel;
}>;