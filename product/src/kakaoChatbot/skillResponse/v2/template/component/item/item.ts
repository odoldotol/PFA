import {
  Carousel,
  CarouselCardKey
} from './carousel';
import { SimpleText } from './simpleText';
import { TextCard } from './textCard';

export * from './common';
export {
  Key as ItemKey,
  Card as CardItem,
  Item
};

type Key =
| 'simpleText'
| 'simpleImage'
| CardKey
| 'carousel';

type CardKey =
| 'textCard'
| CarouselCardKey;

type Card<T extends CardKey = CardKey> =
T extends 'textCard' ? TextCard :
// T extends 'basicCard' ? BasicCard :
// T extends 'commerceCard' ? CommerceCard :
// T extends 'listCard' ? ListCard :
// T extends 'itemCard' ? ItemCard :
never;

type Item<T extends Key = Key> =
T extends 'simpleText' ? SimpleText :
// T extends 'simpleImage' ? SimpleImage :
T extends CardKey ? Card<T> :
T extends 'carousel' ? Carousel :
never;