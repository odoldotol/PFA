import { Extra, Label } from "./button";
import { ButtonChildFactory } from "./button.factory";
import { WebLinkButton, WebLinkUrl } from "./webLink";

export const webLinkButtonFactory: ButtonChildFactory = (
  label: Label,
  webLinkUrl: WebLinkUrl,
  extra?: Extra
): WebLinkButton => {
  return new WebLinkButton(label, webLinkUrl, extra);
};