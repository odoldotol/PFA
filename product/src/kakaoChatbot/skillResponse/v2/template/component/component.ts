// import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { ItemKey, Item } from "./item";

export abstract class Component<T extends ItemKey = ItemKey> {
  readonly simpleText?: T extends 'simpleText' ? Item<T> : never;
  // simpleImage
  readonly textCard?: T extends 'textCard' ? Item<T> : never;
  // basicCard
  // commerceCard
  // listCard
  // itemCard
  readonly carousel?: T extends 'carousel' ? Item<T> : never;
}
