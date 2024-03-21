import { Component } from "./component";
import { Item } from "./item";

export class CarouselComponent
  extends Component<'carousel'>
{
  constructor(
    public override readonly carousel: Item<'carousel'>
  ) {
    super();
  }
}
