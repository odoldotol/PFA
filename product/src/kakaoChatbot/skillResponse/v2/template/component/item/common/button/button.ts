import { ApiProperty } from "@nestjs/swagger";

export enum ButtonAction {
  WEBLINK = "webLink",
  MESSAGE = "message",
  PHONE = "phone",
  BLOCK = "block",
  SHARE = "share",
  OPERATOR = "operator",
}

/**
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#button
 */
export abstract class Button<A extends ButtonAction = ButtonAction> {

  @ApiProperty({ type: "string", maxLength: 14 })
  readonly label: string;

  @ApiProperty({ enum: ButtonAction })
  readonly action: A;

  @ApiProperty({
    type: "string",
    format: "url",
    required: false,
    description: "action 이 webLink 일 경우 필수"
  })
  abstract readonly webLinkUrl?
  : A extends ButtonAction.WEBLINK ? string : never;

  @ApiProperty({
    type: "string",
    required: false,
    description: "action 이 message 일 경우 필수, block 일 경우 옵션"
  })
  abstract readonly messageText?
  : A extends ButtonAction.MESSAGE | ButtonAction.BLOCK ? string : never;

  @ApiProperty({
    type: "string",
    format: "phone",
    required: false,
    description: "action 이 phone 일 경우 필수"
  })
  abstract readonly phoneNumber?
  : A extends ButtonAction.PHONE ? string : never;

  @ApiProperty({
    type: "string",
    required: false,
    description: "action 이 block 일 경우 필수"
  })
  abstract readonly blockId?
  : A extends ButtonAction.BLOCK ? string : never;

  @ApiProperty()
  readonly extra?: Extra;

  constructor(
    label: string,
    action: A,
    extra?: Extra
  ) {
    this.label = label;
    this.action = action;
    extra && (this.extra = extra);
  }
}

export type Extra = Readonly<{
  [key: string]: any;
}>;