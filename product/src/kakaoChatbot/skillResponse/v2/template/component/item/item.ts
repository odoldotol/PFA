import { Carousel, CarouselCardKey } from './carousel';
import { SimpleText } from './simpleText';
import { TextCard } from './textCard';

export * from './common';
export {
  Key as ItemKey,
  Card as CardItem,
  Item,
  SimpleText,
  TextCard,
  Carousel,
};

type CardKey =
| Key.TEXTCARD
| CarouselCardKey;

type Card<T extends CardKey = CardKey> =
T extends Key.TEXTCARD ? TextCard :
// T extends Key.BASICCARD ? BasicCard :
// T extends Key.COMMERCECARD ? CommerceCard :
// T extends Key.LISTCARD ? ListCard :
// T extends Key.ITEMCARD ? ItemCard :
never;

type Item<T extends Key = Key> =
T extends Key.SIMPLETEXT ? SimpleText :
// T extends K.SIMPLEIMAGE ? SimpleImage :
T extends CardKey ? Card<T> :
T extends Key.CAROUSEL ? Carousel :
never;

enum Key {
  BASICCARD = 'basicCard',
  COMMERCECARD = 'commerceCard',
  LISTCARD = 'listCard',
  ITEMCARD = 'itemCard',
  TEXTCARD = 'textCard',
  SIMPLETEXT = 'simpleText',
  SIMPLEIMAGE = 'simpleImage',
  CAROUSEL = 'carousel'
}