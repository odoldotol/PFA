import { Router } from "src/common/interface";
import { RouteName } from "../kakaoChatbot.controller";

export const apiMetadata: Router<RouteName> = {
  prefix: 'kakao-chatbot',
  routes: {
    inquireAsset: {
      path: 'asset/inquire',
    },
    addAssetSubscription: {
      path: 'asset-subscription/add',
    },
    cancelAssetSubscription: {
      path: 'asset-subscription/cancel',
    },
    inquireSubscribedAsset: {
      path: 'asset/subscriptions/inquire',
    },
    reportTicker: {
      path: 'report/ticker',
    },
  },
};