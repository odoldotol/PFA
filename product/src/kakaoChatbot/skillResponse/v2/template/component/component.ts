import { OnlyOneOf } from "src/common/util";
import {
  SimpleText,
  TextCard,
  Carousel,
  SimpleImage,
  BasicCard,
  ListCard
} from "./item";

export type Component = OnlyOneOf<{
  readonly simpleText: SimpleText;
  readonly simpleImage: SimpleImage;
  readonly textCard: TextCard;
  readonly basicCard: BasicCard;
  // commerceCard
  readonly listCard: ListCard
  // itemCard
  readonly carousel: Carousel;
}>;