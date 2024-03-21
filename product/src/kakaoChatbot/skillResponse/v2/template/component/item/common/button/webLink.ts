import { ApiProperty } from "@nestjs/swagger";
import {
  Button,
  ButtonAction,
  Extra
} from "./button";

export class WebLinkButton
  extends Button<ButtonAction.WEBLINK>
{
  @ApiProperty({ type: "string", format: "url" })
  readonly webLinkUrl: string;

  readonly messageText?: never;
  readonly phoneNumber?: never;
  readonly blockId?: never;

  constructor(
    label: string,
    webLinkUrl: string,
    extra?: Extra
  ) {
    super(
      label,
      ButtonAction.WEBLINK,
      extra
    );

    this.webLinkUrl = webLinkUrl;
  }
}
