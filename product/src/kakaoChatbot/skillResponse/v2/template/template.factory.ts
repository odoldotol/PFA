import { ComponentFactory, ItemKey } from "./component";
import { Outputs, QuickReplies, SkillTemplate } from "./template";

export class SkillTemplateFactory {
  static create<T1 extends ItemKey, T2 extends ItemKey | null, T3 extends (T2 extends ItemKey ? (ItemKey | null) : null)>(
    outputsComponentsParameters: ComponentsParameters<T1, T2, T3>,
    quickReplies?: QuickReplies
  ): SkillTemplate<T1, T2, T3> {
    const outputs
    = outputsComponentsParameters
    .map(([itemKey, item]) => ComponentFactory.create(itemKey, item)) as
    Outputs<T1, T2, T3>;

    return new SkillTemplate(outputs, quickReplies);
  }
}

type ComponentsParameters<
T1 extends ItemKey,
T2 extends ItemKey | null,
T3 extends (T2 extends ItemKey ? (ItemKey | null) : null)
> = Readonly<T2 extends ItemKey ? (T3 extends ItemKey ?
  [Parameters<typeof ComponentFactory.create<T1>>, Parameters<typeof ComponentFactory.create<T2>>, Parameters<typeof ComponentFactory.create<T3>>] :
  [Parameters<typeof ComponentFactory.create<T1>>, Parameters<typeof ComponentFactory.create<T2>>]
) : [Parameters<typeof ComponentFactory.create<T1>>]>;