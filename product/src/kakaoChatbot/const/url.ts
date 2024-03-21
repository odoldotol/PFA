import { ApiUrl } from "src/common/interface";
import { ApiName } from "../kakaoChatbot.controller";

export const URL_PREFIX = '/kakao-chatbot';

export const URL_API: ApiUrl<ApiName> = {
  inquireAsset: {
    path: '/asset/inquire',
  },
  addAssetSubscription: {
    path: '/asset-subscription/add',
  },
  cancelAssetSubscription: {
    path: '/asset-subscription/cancel',
  },
  inquireSubscribedAsset: {
    path: '/asset/subscriptions/inquire',
  },
  reportTicker: {
    path: '/report/ticker',
  },
};