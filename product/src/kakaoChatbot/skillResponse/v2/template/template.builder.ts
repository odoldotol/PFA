import { Component } from "./component";
import { Outputs, QuickReplies, SkillTemplate } from "./template";

class SkillTemplateBuilderData {
  public quickReplies?: QuickReplies;
}

abstract class SkillTemplateRootBuilder {
  constructor(
    protected readonly data: SkillTemplateBuilderData,
  ) {}

  /**
   * @todo QuickReply Creation
   */
  public addQuickReplies(quickReplies: QuickReplies): this {
    this.data.quickReplies = quickReplies;
    return this;
  }

  /**
   * 3개 초과 추가 부터는 무시됨
   */
  abstract addComponent(component: Component): ValidSkillTemplateBuilder;
}

export class SkillTemplateBuilder
  extends SkillTemplateRootBuilder
{
  constructor() {
    super(new SkillTemplateBuilderData());
  }

  public addComponent(component: Component): ValidSkillTemplateBuilder {
    return new ValidSkillTemplateBuilder(this.data, component);
  }
}

class ValidSkillTemplateBuilder
  extends SkillTemplateRootBuilder
{
  private readonly outputs: Outputs;

  constructor(
    data: SkillTemplateBuilderData,
    component: Component,
  ) {
    super(data);
    this.outputs = [component];
  }

  public addComponent(component: Component): this {
    if (this.outputs.length < 3) {
      this.outputs.push(component);
    }
    return this;
  }

  public build(): SkillTemplate {
    return new SkillTemplate(
      this.outputs,
      this.data.quickReplies
    );
  }
}
