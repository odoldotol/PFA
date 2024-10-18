import { Thumbnail } from "./common";
import {
  CardItem,
  CardKey,
  ItemKey as Key
} from "./item";
import {
  isLimitedArray,
  LimitedArray
} from "src/common/util";

/**
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#carousel
 * 
 * items 갯수 제한 (LISTCARD ? 5 : 10)
 */
export class Carousel<T extends CardKey = CardKey> {

  readonly type: T; // Todo: textCard 확인하고 필요시 Carousel, CarouselCardKey, CardKey 수정
  readonly items: Items<T>;
  readonly header?: CarouselHeader; // Todo: TextCard, ListCard 는 케로셀 헤더 사용 불가

  /**
   * items 일정 수 이상은 짤림 (LISTCARD ? 5 : 10) 
   */
  constructor(
    type: T,
    items: CardItem<T>[],
    header?: CarouselHeader
  ) {
    this.type = type;
    this.items = toCarouselItems(type, items);
    header && (this.header = header);
  }
}

export type Items<T extends CardKey>
= Readonly<LimitedArray<CardItem<T>, T extends Key.LISTCARD ? 5 : 10>>;

/**
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#carouselheader
 */
export type CarouselHeader = Readonly<{
  title: string; // ~2줄 (한 줄에 들어갈 수 있는 글자 수는 기기에 따라 달라짐)
  description: string; // ~3중 (한 줄에 들어갈 수 있는 글자 수는 기기에 따라 달라짐)
  thumbnail: Thumbnail;
}>;

/**
 * items 갯수 제한 (LISTCARD ? 5 : 10)
 */
const toCarouselItems
= <T extends CardKey = CardKey>(
  type: T,
  items: CardItem<T>[]
): Items<T> => {
  items = items.slice(0, type === Key.LISTCARD ? 5 : 10);

  if (isCarouselItems(type, items)) {
    return items;
  } else {
    throw new Error("never");
  }
};

const isCarouselItems = <T extends CardKey = CardKey>(
  type: T,
  items: CardItem<T>[]
): items is Items<T> => {
  return isLimitedArray(
    items,
    type === Key.LISTCARD ? 5 : 10
  );
};