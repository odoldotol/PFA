import { Component } from "./component";
import { Item } from "./item";

export class SimpleTextComponent
  extends Component<'simpleText'>
{
  constructor(
    public override readonly simpleText: Item<'simpleText'>
  ) {
    super();
  }
}
