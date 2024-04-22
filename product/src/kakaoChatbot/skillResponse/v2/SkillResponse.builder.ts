import { ContextControl, Data, KakaoChatbotVersion, SkillResponse, SkillResponseOptions } from "./skillResponse";
import { SkillTemplate } from "./template";

export class SkillResponseBuilder {

  private readonly options: SkillResponseOptions;

  constructor(version: KakaoChatbotVersion = KakaoChatbotVersion.V2) {
    this.options = { version };
  }

  public addTemplate(skillTemplate: SkillTemplate): this {
    this.options.template = skillTemplate;
    return this;
  }

  /**
   * @todo ContextControl Creation
   */
  public addContextControl(contextControl: ContextControl): this {
    this.options.context = contextControl;
    return this;
  }

  public addData(data: Data): this {
    this.options.data = data;
    return this;
  }

  public build(): SkillResponse {
    return new SkillResponse(this.options);
  }
}
