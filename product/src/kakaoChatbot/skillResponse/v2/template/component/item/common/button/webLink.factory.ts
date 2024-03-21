import { Extra } from "./button";
import { WebLinkButton } from "./webLink";

export class WebLinkButtonFactory {

  static create(
    label: string,
    webLinkUrl: string,
    extra?: Extra
  ): WebLinkButton {
    return new WebLinkButton(label, webLinkUrl, extra);
  }
}
