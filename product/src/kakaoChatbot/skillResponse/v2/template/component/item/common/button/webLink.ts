import { ButtonAction } from "../action";
import { Extra } from "../extra";
import {
  Button,
  Label
} from "./button";

export class WebLinkButton
  extends Button
{
  readonly webLinkUrl: WebLinkUrl;

  constructor(
    label: Label,
    webLinkUrl: WebLinkUrl,
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

export type WebLinkUrl = string;