import { ApiProperty } from "@nestjs/swagger";
import {
  Button,
  ButtonAction,
  Extra
} from "./button";

export class blockButton
  extends Button<ButtonAction.BLOCK>
{
  @ApiProperty({ type: "string" })
  override readonly blockId: string;

  @ApiProperty({ type: "string", required: false })
  readonly messageText?: string;

  readonly webLinkUrl?: never;
  readonly phoneNumber?: never;
  
  constructor(
    label: string,
    options: BlockOptions,
    extra?: Extra
  ) {
    super(
      label,
      ButtonAction.BLOCK,
      extra
    );

    this.blockId = options.blockId;
    options.messageText && (this.messageText = options.messageText);
  }
}

type BlockOptions = {
  blockId: string;
  messageText: string | undefined;
};