import {
  Button,
  ButtonAction,
  Extra,
  Label
} from "./button";

export class blockButton
  extends Button
{
  readonly blockId: BlockId;
  readonly messageText?: MessageText;
  
  constructor(label: Label, blockId: BlockId, extra?: Extra)
  constructor(label: Label, blockId: BlockId, messageText?: MessageText, extra?: Extra)
  constructor(
    label: Label,
    blockId: BlockId,
    messageTextOrExtra?: MessageText | Extra,
    extra?: Extra
  ) {
    let messageText: MessageText | undefined = undefined;

    if (messageTextOrExtra) {
      if (typeof messageTextOrExtra === "object") {
        extra = messageTextOrExtra;
      } else {
        messageText = messageTextOrExtra
      }
    }

    super(
      label,
      ButtonAction.BLOCK,
      extra
    );

    this.blockId = blockId;

    if (messageText !== undefined) {
      this.messageText = messageText;
    }
  }
}

export type BlockId = string;

export type MessageText = string; //