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
  protected addQuickRepliesRoot(quickReplies: QuickReplies): void {
    this.data.quickReplies = quickReplies;
  }

  /**
   * 3개 초과 추가 부터는 무시됨
   */
  abstract addComponent(component: Component): ValidSkillTemplateBuilder;

  /**
   * @todo QuickReply Creation
   */
  abstract addQuickReplies(quickReplies: QuickReplies): this;
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

  public addQuickReplies(quickReplies: QuickReplies): this {
    this.addQuickRepliesRoot(quickReplies);
    return this;
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

  public addQuickReplies(quickReplies: QuickReplies): this {
    this.addQuickRepliesRoot(quickReplies);
    return this;
  }

  public build(): SkillTemplate {
    return new SkillTemplate(
      this.outputs,
      this.data.quickReplies
    );
  }
}
