/**
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#button
 */
export abstract class Button {

  readonly label: Label;
  readonly action: ButtonAction;
  readonly extra?: Extra;

  constructor(
    label: Label,
    action: ButtonAction,
    extra?: Extra
  ) {
    this.label = label;
    this.action = action;
    extra && (this.extra = extra);
  }
}

export enum ButtonAction {
  WEBLINK = "webLink",
  MESSAGE = "message",
  PHONE = "phone",
  BLOCK = "block",
  SHARE = "share",
  OPERATOR = "operator",
}

export type Extra = Readonly<{
  [key: string]: any;
}>;

/**
 * maxLength 14
 * (단, 가로배열(썸네일이 1:1 일떄) 8)
 */
export type Label = string;