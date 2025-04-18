import { Router } from "src/common/interface";
import { RouteName } from "../kakaoChatbot.controller";

export const apiMetadata: Router<RouteName> = {
  prefix: 'kakao-chatbot',
  routes: {
    inquireAsset_v2: {
      path: 'asset/inquire',
    },
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
    reportInquireWords: {
      path: 'report/inquire-words',
    },
  },
};