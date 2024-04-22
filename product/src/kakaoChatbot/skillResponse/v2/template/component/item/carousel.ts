import { LimitedArray } from "src/common/interface";
import { CardItem, ItemKey as Key } from "./item";
import { Thumbnail } from "./common";

/**
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#carousel
 */
export class Carousel<T extends CarouselCardKey = CarouselCardKey> {

  readonly type: T; // Todo: textCard 확인하고 필요시 Carousel, CarouselCardKey, CardKey 수정
  readonly items: Items<T>;
  readonly header?: CarouselHeader; // Todo: TextCard, ListCard 는 케로셀 헤더 사용 불가

  constructor(
    type: T,
    items: Items<T>,
    header?: CarouselHeader
  ) {
    this.type = type;
    this.items = items;
    header && (this.header = header);
  }
}

export type CarouselCardKey =
| Key.BASICCARD
| Key.COMMERCECARD
| Key.LISTCARD
| Key.ITEMCARD;

export type Items<T extends CarouselCardKey>
= Readonly<LimitedArray<CardItem<T>, T extends Key.LISTCARD ? 5 : 10>>;

/**
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#carouselheader
 */
export type CarouselHeader = Readonly<{
  title: string; // ~2줄 (한 줄에 들어갈 수 있는 글자 수는 기기에 따라 달라짐)
  description: string; // ~3중 (한 줄에 들어갈 수 있는 글자 수는 기기에 따라 달라짐)
  thumbnail: Thumbnail;
}>;