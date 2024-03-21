import { Button, ButtonAction, Extra } from "./button";
import { BlockButtonFactory } from "./block.factory";
import { WebLinkButtonFactory } from "./webLink.factory";

export const factoryMap
: Map<ButtonAction, ButtomFactory>
= new Map();

factoryMap.set(ButtonAction.WEBLINK, WebLinkButtonFactory);
factoryMap.set(ButtonAction.BLOCK, BlockButtonFactory);

interface ButtomFactory {
  create(label: string, option: string, extra?: Extra): Button;
}
