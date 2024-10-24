import { BasicCard } from './basicCard';
import { Carousel } from './carousel';
import { SimpleImage } from './simpleImage';
import { SimpleText } from './simpleText';
import { TextCard } from './textCard';
import {
  ListCard,
  ListItemBuilder
} from "./listCard";

export * from './common';
export {
  Key as ItemKey,
  CardKey,
  Card as CardItem,
  Item,
  SimpleText,
  SimpleImage,
  TextCard,
  Carousel,
  BasicCard,
  ListCard,
  ListItemBuilder,
};

type CardKey =
| Key.TEXTCARD
| Key.BASICCARD
| Key.COMMERCECARD
| Key.LISTCARD
| Key.ITEMCARD;

type Card<T extends CardKey = CardKey> =
T extends Key.TEXTCARD ? TextCard :
T extends Key.BASICCARD ? BasicCard :
// T extends Key.COMMERCECARD ? CommerceCard :
T extends Key.LISTCARD ? ListCard :
// T extends Key.ITEMCARD ? ItemCard :
never;

type Item<T extends Key = Key> =
T extends Key.SIMPLETEXT ? SimpleText :
T extends Key.SIMPLEIMAGE ? SimpleImage :
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
