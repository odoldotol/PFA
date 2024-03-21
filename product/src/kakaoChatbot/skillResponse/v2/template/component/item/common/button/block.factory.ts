import { Extra } from "./button";
import { blockButton } from "./block";

export class BlockButtonFactory {

  static create(label: string, blockId: string, messageText?: string, extra?: Extra): blockButton;
  static create(label: string, blockId: string, extra?: Extra): blockButton;
  static create(
    label: string,
    blockId: string,
    messageTextOrExtra?: string | Extra,
    extra?: Extra
  ): blockButton {
    if (typeof messageTextOrExtra === "object") {
      extra = messageTextOrExtra;
    }

    let messageText: string | undefined = undefined;

    if (typeof messageTextOrExtra === "string") {
      messageText = messageTextOrExtra;
    }

    return new blockButton(label, {
      blockId,
      messageText
    }, extra);
  }
}
