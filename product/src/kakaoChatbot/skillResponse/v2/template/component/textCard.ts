import { Item } from "./item";
import { Component } from "./component";

export class TextCardComponent
  extends Component<'textCard'>
{
  constructor(
    public override readonly textCard: Item<'textCard'>
  ) {
    super();
  }
}
