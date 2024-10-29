import { Component } from "./component";
import { QuickReply, SkillTemplate } from "./template";

class SkillTemplateData {
  public outputs: Component[] = [];
  public quickReplies: QuickReply[] = [];
}

abstract class SkillTemplateBuilderRoot {
  constructor(
    protected readonly data: SkillTemplateData,
  ) {}

  /**
   * @todo QuickReply Creation
   * 
   * - 10개 초과 무시됨
   */
  public addQuickReply(quickReply: QuickReply): this {
    this.data.quickReplies.push(quickReply);
    return this;
  }

  /**
   * 3개 초과 추가 부터는 무시됨
   */
  public abstract addComponent(component: Component): ValidSkillTemplateBuilder;
}

/**
 * addComponent 를 통해 build 를 얻을 수 있음.
 */
export class SkillTemplateBuilder
  extends SkillTemplateBuilderRoot
{
  constructor() {
    super(new SkillTemplateData());
  }

  public addComponent(
    component: Component
  ): ValidSkillTemplateBuilder {
    this.data.outputs.push(component);
    return new ValidSkillTemplateBuilder(this.data);
  }

}

export class ValidSkillTemplateBuilder
  extends SkillTemplateBuilderRoot
{
  constructor(data: SkillTemplateData) {
    super(data);
  }

  public addComponent(
    component: Component
  ): this {
    this.data.outputs.push(component);
    return this;
  }

  public build(): SkillTemplate {
    return new SkillTemplate(
      this.data.outputs,
      this.data.quickReplies
    );
  }

}
