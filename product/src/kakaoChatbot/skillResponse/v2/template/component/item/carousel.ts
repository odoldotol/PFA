import { ApiProperty } from "@nestjs/swagger";
import { LimitedArray } from "src/common/interface";
import { CardItem } from "./item";
import { Thumbnail } from "./common";

/**
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#carousel
 */
export class Carousel<T extends CarouselCardKey = CarouselCardKey> {

  // Todo: textCard 확인하고 필요시 Carousel, CarouselCardKey, CardKey 수정
  @ApiProperty({
    enum: [
      "basicCard",
      "commerceCard",
      "listCard",
      "itemCard"
    ]
  })
  readonly type: T;

  @ApiProperty({
    type: "array",
    items: { type: "ItemCard" },
    minItems: 1,
    maxItems: 10,
    description: "Card 최대 10개, ListCard 의 경우는 최대 5개"
  })
  readonly items: Items<T>;

  @ApiProperty({
    description: "TextCard, ListCard 는 케로셀 헤더 사용 불가",
    required: false
  })
  readonly header?: CarouselHeader;

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
| 'basicCard'
| 'commerceCard'
| 'listCard'
| 'itemCard';

export type Items<T extends CarouselCardKey>
= Readonly<LimitedArray<CardItem<T>, T extends 'listCard' ? 5 : 10>>;

/**
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#carouselheader
 */
export type CarouselHeader = Readonly<{
  title: string; // ~2줄 (한 줄에 들어갈 수 있는 글자 수는 기기에 따라 달라짐)
  description: string; // ~3중 (한 줄에 들어갈 수 있는 글자 수는 기기에 따라 달라짐)
  thumbnail: Thumbnail;
}>;