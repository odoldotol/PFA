import { SkillResponse, SkillResponseOptions, Template } from "./skillResponse";
import { ItemKey, SkillTemplateFactory } from "./template";

export class SkillResponseFactory {
  static create<T1 extends ItemKey | null = ItemKey | null, T2 extends (T1 extends ItemKey ? (ItemKey | null) : null) = null, T3 extends (T2 extends ItemKey ? (ItemKey | null) : null) = null>(
    options?: Options<T1, T2, T3>
  ): SkillResponse<T1, T2, T3> {

    const template = options?.components && SkillTemplateFactory.create(
      options.components,
      options.quickReplies
    ) as Template<T1, T2, T3>;;

    const skillResponseOptions
    : SkillResponseOptions<Template<T1, T2, T3>>
    = {};

    template && (skillResponseOptions.template = template);
    options?.context && (skillResponseOptions.context = options.context);
    options?.data && (skillResponseOptions.data = options.data);

    return new SkillResponse(skillResponseOptions);
  }
}

type Options<
T1 extends ItemKey | null = ItemKey | null,
T2 extends (T1 extends ItemKey ? (ItemKey | null) : null) = null,
T3 extends (T2 extends ItemKey ? (ItemKey | null) : null) = null
> = {
  components?: T1 extends ItemKey ? Parameters<typeof SkillTemplateFactory.create<T1, T2, T3>>[0] : never;
} & {
  quickReplies?: T1 extends ItemKey ? Parameters<typeof SkillTemplateFactory.create<T1, T2, T3>>[1] : never;
} & SkillResponseOptions<never>;