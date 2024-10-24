import { Component } from "./component";
import { ListCardItemBuilder, ValidListCardItemBuilder } from "./item";
import { ListItem } from "./item/listCard";
import { ListCardComponent } from "./listCard";

export class ListCardBuilder
  extends ListCardItemBuilder
{
  public override addItem(item: ListItem): ValidListCardBuilder {
    super.addItem(item);
    return new ValidListCardBuilder(super.data);
  }
}

export class ValidListCardBuilder
  extends ValidListCardItemBuilder
{
  public buildComponent(): Component {
    return new ListCardComponent(this.buildItem());
  }
}
